'use client';
import { useEffect, useState } from "react";
import SideBar from "../SideBar/page";
import styles from "./styles.module.css";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { FaRegTrashAlt } from "react-icons/fa";

function Main() {
    const [cards, setCards] = useState([]);
    const [operations, setOperations] = useState([]);
    const [shop, setShop] = useState('');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [commation, setCommation] = useState('');
    const [deposit, setDeposit] = useState(0);
    const [withdraw, setWithdraw] = useState(0);
    const [cardAmount, setCardAmount] = useState(0);
    const [total, setTotal] = useState(0);
    const [type, setType] = useState('ارسال'); // 👈 نوع العملية

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storageShop = localStorage.getItem('shop');
            setShop(storageShop);

            const q = query(collection(db, 'cards'), where('shop', '==', storageShop));
            const unsubscripe = onSnapshot(q, (querySnapshot) => {
                const cardsArrya = [];
                querySnapshot.forEach((doc) => {
                    cardsArrya.push({ ...doc.data(), id: doc.id });
                });
                setCards(cardsArrya);
            });

            const operationsQ = query(collection(db, 'operations'), where('shop', '==', storageShop));
            const unsubscripeOper = onSnapshot(operationsQ, (querySnapshot) => {
                const operationsArray = [];
                querySnapshot.forEach((doc) => {
                    operationsArray.push({ ...doc.data(), id: doc.id });
                });
                setOperations(operationsArray);
            });

            return () => { unsubscripe(); unsubscripeOper(); };
        }
    }, []);

    useEffect(() => {
        const subTotal = operations.reduce((acc, operation) => {
            return acc + Number(operation.commation);
        }, 0);
        setTotal(subTotal);
    }, [operations]);

    const handlePhoneChande = async (e) => {
        const value = e.target.value;
        setPhone(value);
        const q = query(collection(db, 'cards'), where('shop', '==', shop), where('phone', '==', value));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const cardDoc = querySnapshot.docs[0];
            const cardData = cardDoc.data();
            setDeposit(cardData.depositLimit);
            setWithdraw(Number(cardData.withdrawLimit) - Number(cardData.amount));
            setCardAmount(cardData.amount);
        }
        if (!value) {
            setDeposit(0);
            setWithdraw(0);
            setCardAmount(0);
        }
    };

const handleOperation = async () => {
    if (!phone || !amount || !commation) {
        alert('برجاء ادخال كل البيانات قبل تنفيذ العملية');
        return;
    }

    const q = query(collection(db, 'cards'), where('shop', '==', shop), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const cardDoc = querySnapshot.docs[0];
        const cardRef = doc(db, 'cards', cardDoc.id);
        const cardData = cardDoc.data();

        const amountNum = Number(amount);

        if (type === 'ارسال') {
            // ✅ تحقق من الرصيد
            if (amountNum > Number(cardData.amount)) {
                alert("الرصيد غير كافي لتنفيذ عملية الإرسال");
                return;
            }

            await addDoc(collection(db, 'operations'), {
                phone,
                amount,
                commation,
                shop,
                type,
                date: new Date().toISOString().split("T")[0]
            });

            await updateDoc(cardRef, {
                amount: Number(cardData.amount) - amountNum,
                depositLimit: Number(cardData.depositLimit) - amountNum
            });

        } else if (type === 'استلام') {
            await addDoc(collection(db, 'operations'), {
                phone,
                amount,
                commation,
                shop,
                type,
                date: new Date().toISOString().split("T")[0]
            });

            await updateDoc(cardRef, {
                amount: Number(cardData.amount) + amountNum,
                withdrawLimit: Number(cardData.withdrawLimit) - amountNum
            });
        }

        // Reset fields
        setPhone('');
        setAmount('');
        setCommation('');
    }
};



const handleDeleteOperation = async (id) => {
    try {
        // 1. هات بيانات العملية
        const operationRef = doc(db, 'operations', id);
        const operationSnap = await getDoc(operationRef);

        if (!operationSnap.exists()) {
            alert("العملية غير موجودة");
            return;
        }

        const operation = operationSnap.data();

        // 2. هات بيانات الخط
        const cardQuery = query(
            collection(db, 'cards'),
            where('shop', '==', shop),
            where('phone', '==', operation.phone)
        );
        const cardSnap = await getDocs(cardQuery);

        if (cardSnap.empty) {
            alert("لم يتم العثور على الخط المرتبط بالعملية");
            return;
        }

        const cardDoc = cardSnap.docs[0];
        const cardRef = doc(db, 'cards', cardDoc.id);
        const cardData = cardDoc.data();

        let newAmount = Number(cardData.amount);
        let newDepositLimit = Number(cardData.depositLimit);
        let newWithdrawLimit = Number(cardData.withdrawLimit);
        const operationAmount = Number(operation.amount);

        if (operation.type === 'ارسال') {
            // لو حذف عملية إرسال: زود الرصيد وحد الإرسال
            newAmount += operationAmount;
            newDepositLimit += operationAmount;

        } else if (operation.type === 'استلام') {
            // تحقق إن الرصيد يسمح بطرح العملية
            if (newAmount - operationAmount < 0) {
                alert("لا يمكن حذف العملية لأن ذلك سيؤدي إلى رصيد سالب.");
                return;
            }
            newAmount -= operationAmount;
            newWithdrawLimit += operationAmount;
        }

        // 3. تحديث بيانات الخط
        await updateDoc(cardRef, {
            amount: newAmount,
            depositLimit: newDepositLimit,
            withdrawLimit: newWithdrawLimit
        });

        // 4. حذف العملية
        await deleteDoc(operationRef);
        alert("تم حذف العملية وتعديل الرصيد بنجاح ✅");

    } catch (error) {
        console.error("حدث خطأ أثناء حذف العملية:", error);
        alert("حدث خطأ أثناء حذف العملية ❌");
    }
};



    const handleDeleteDay = async () => {
        const confirmDelete = window.confirm("هل تريد تقفيل اليوم");
        if (!confirmDelete) return;

        const querySnapshot = await getDocs(collection(db, "operations"));

        const addToReports = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return addDoc(collection(db, "reports"), {
                ...data,
                date: new Date().toISOString().split("T")[0]
            });
        });

        const deletePromises = querySnapshot.docs.map((docSnap) =>
            deleteDoc(doc(db, "operations", docSnap.id))
        );

        await Promise.all([...addToReports, ...deletePromises]);
        alert("تم تقفيل اليوم بنجاح ✅");
    };

    const phoneToAmountMap = {};
    cards.forEach(card => {
        phoneToAmountMap[card.phone] = card.amount;
    });

    const netAmount = type === "ارسال"
        ? Number(amount) + Number(commation)
        : Number(amount) - Number(commation);

    return (
        <div className="main">
            <SideBar />
            <div className={styles.mainContainer}>
                <div className={styles.btnsContainer}>
                    <button onClick={handleOperation}>{type === "ارسال" ? "ارسال رصيد" : "استلام رصيد"}</button>
                    <button onClick={handleDeleteDay}>تقفيل اليوم</button>
                </div>
                <div className={styles.content}>
                    <div className="inputContainer">
                        <label>نوع العملية:</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="ارسال">ارسال</option>
                            <option value="استلام">استلام</option>
                        </select>
                    </div>
                    <div className="inputContainer">
                        <label>رقم الخط :</label>
                        <input list="numbers" type="number" value={phone} placeholder="احبث عن رقم الخط" onChange={handlePhoneChande} />
                        <datalist id="numbers">
                            {cards.map(card => (
                                <option key={card.id} value={card.phone} />
                            ))}
                        </datalist>
                    </div>
                    <div className={styles.amoutContainer}>
                        <div className="inputContainer">
                            <label> المبلغ :</label>
                            <input type="number" value={amount} placeholder="اضف المبلغ" onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="inputContainer">
                            <label>العمولة :</label>
                            <input type="number" value={commation} placeholder="اضف العمولة" onChange={(e) => setCommation(e.target.value)} />
                        </div>
                        <div className="inputContainer">
                            <label>صافي المبلغ :</label>
                            <input type="number" value={netAmount} readOnly disabled />
                        </div>
                    </div>
                    <div className={styles.amoutContainer}>
                        <div className="inputContainer">
                            <label> يمكن ارسال :</label>
                            <input type="number" value={deposit} disabled readOnly />
                        </div>
                        <div className="inputContainer">
                            <label>يمكن استلام :</label>
                            <input type="number" value={withdraw} disabled readOnly />
                        </div>
                        <div className="inputContainer">
                            <label> رصيد الخط :</label>
                            <input type="number" value={cardAmount} disabled readOnly />
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th>الرقم المستخدم</th>
                                    <th>نوع العملية</th>
                                    <th>المبلغ</th>
                                    <th>العمولة</th>
                                    <th>صافي المبلغ</th>
                                    <th>رصيد الخط</th>
                                    <th>التفاعل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operations.map(operation => (
                                    <tr key={operation.id}>
                                        <td>{operation.phone}</td>
                                        <td>{operation.type}</td>
                                        <td>{operation.amount}</td>
                                        <td>{operation.commation}</td>
                                        <td>
                                            {operation.type === "ارسال"
                                                ? Number(operation.amount) + Number(operation.commation)
                                                : Number(operation.amount) - Number(operation.commation)
                                            }
                                        </td>
                                        <td>{phoneToAmountMap[operation.phone] || 0}</td>
                                        <td className="actions">
                                            <button onClick={() => handleDeleteOperation(operation.id)}><FaRegTrashAlt /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={7}>صافي الربح اليومي : {total} جنية</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;
