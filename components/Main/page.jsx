'use client';
import { useEffect, useState } from "react";
import SideBar from "../SideBar/page";
import styles from "./styles.module.css";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
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
            setWithdraw(cardData.withdrawLimit);
            setCardAmount(cardData.amount);
        }
        if (!value) {
            setDeposit(0);
            setWithdraw(0);
            setCardAmount(0);
        }
    };

    const handleSend = async () => {
        if (!phone || !amount || !commation) {
            alert('برجاء ادخال كل البيانات قبل تنفيذ العملية');
        } else {
            await addDoc(collection(db, 'operations'), {
                phone,
                amount,
                commation,
                shop,
                type: 'ارسال',
                date: new Date().toISOString().split("T")[0]
            });
            await addDoc(collection(db, 'reports'), {
                phone,
                amount,
                commation,
                shop,
                type: 'ارسال',
                date: new Date().toISOString().split("T")[0]
            });
            const q = query(collection(db, 'cards'), where('shop', '==', shop));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const cardDoc = querySnapshot.docs[0];
                const cardRef = doc(db, 'cards', cardDoc.id);
                const cardData = cardDoc.data();
                await updateDoc(cardRef, {
                    amount: Number(cardData.amount) - Number(amount),
                    depositLimit: Number(cardData.depositLimit) - Number(amount)
                });
                setPhone('');
                setAmount('');
                setCommation('');
            }
        }
    };

    const handleGet = async () => {
        if (!phone || !amount || !commation) {
            alert('برجاء ادخال كل البيانات قبل تنفيذ العملية');
        } else {
            await addDoc(collection(db, 'operations'), {
                phone,
                amount,
                commation,
                shop,
                type: 'استلام',
                date: new Date().toISOString().split("T")[0]
            });
            await addDoc(collection(db, 'reports'), {
                phone,
                amount,
                commation,
                shop,
                type: 'استلام',
                date: new Date().toISOString().split("T")[0]
            });
            const q = query(collection(db, 'cards'), where('shop', '==', shop));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const cardDoc = querySnapshot.docs[0];
                const cardRef = doc(db, 'cards', cardDoc.id);
                const cardData = cardDoc.data();
                await updateDoc(cardRef, {
                    amount: Number(cardData.amount) + Number(amount),
                    withdrawLimit: Number(cardData.withdrawLimit) - Number(amount)
                });
                setPhone('');
                setAmount('');
                setCommation('');
            }
        }
    };

    const handleDeleteDay = async () => {
        const confirmDelete = window.confirm("هل تريد تقفيل اليوم");
        if (!confirmDelete) return;
        const querySnapshot = await getDocs(collection(db, "operations"));
        const deletePromises = querySnapshot.docs.map((docSnap) =>
            deleteDoc(doc(db, "operations", docSnap.id))
        );
        await Promise.all(deletePromises);
        alert("تم تقفيل اليوم بنجاح ✅");
    };

    // 🔁 ربط رقم الخط بقيمته
    const phoneToAmountMap = {};
    cards.forEach(card => {
        phoneToAmountMap[card.phone] = card.amount;
    });

    const handleDeleteOperation = async(id) => {
        await deleteDoc(doc(db, 'operations', id))
    }

    return (
        <div className="main">
            <SideBar />
            <div className={styles.mainContainer}>
                <div className={styles.btnsContainer}>
                    <button onClick={handleSend}>ارسال رصيد</button>
                    <button onClick={handleGet}>استلام رصيد</button>
                    <button onClick={handleDeleteDay}>تقفيل اليوم</button>
                </div>
                <div className={styles.content}>
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
                            <label> صافي المبلغ :</label>
                            <input type="number" value={Number(amount) - Number(commation)} disabled readOnly />
                        </div>
                    </div>
                    <div className={styles.amoutContainer}>
                        <div className="inputContainer">
                            <label> يمكن ارسال :</label>
                            <input type="number" value={withdraw} disabled readOnly />
                        </div>
                        <div className="inputContainer">
                            <label>يمكن استلام :</label>
                            <input type="number" value={deposit} disabled readOnly />
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
                                    <th>اجمالي المبلغ</th>
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
                                        <td>{Number(operation.amount) - Number(operation.commation)}</td>
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
