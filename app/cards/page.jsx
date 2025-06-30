'use client';
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { FaRegTrashAlt, FaPen } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Cards() {
    const btns = ['كل الخطوط', 'اضف خط جديد']
    const [cards, setCards] = useState([])
    const [add, setAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [active, setActive] = useState(0)
    const [name, setName] = useState('')
    const [id, setId] = useState('')
    const [userName, setUserName] = useState('')
    const [number, setNumber] = useState('')
    const [phone, setPhone] = useState('')
    const [amount, setAmount] = useState('')
    const [shop, setShop] = useState('')
    const [search, setSearch] = useState('')
    const [deposit, setDeposit] = useState('')
    const [withdraw, setWithdraw] = useState('')
    const [total, setTotl] = useState(0)

    useEffect(() => {
        if(typeof window !== "undefined") {
            const storageShop = localStorage.getItem("shop")
            const storageName = localStorage.getItem('userName')
            if(storageShop) {
                setShop(storageShop)
                setName(storageName)
            }

            let q;
            if(search !== '') {
                q = query(collection(db, 'cards'), where('shop', '==', storageShop), where('phone', '==', search))
            } else {
                q = query(collection(db, 'cards'), where('shop', '==', storageShop))
            }

            const unsunbscribe = onSnapshot(q, async (querySnapshot) => {
                const cardsArray = []
                const now = new Date()
                const currentMonth = now.getMonth()

                for (const docSnap of querySnapshot.docs) {
                    const card = { ...docSnap.data(), id: docSnap.id }
                    const lastReset = card.lastReset ? new Date(card.lastReset).getMonth() : null
                    if (lastReset !== currentMonth) {
                        const cardRef = doc(db, 'cards', docSnap.id)
                        await updateDoc(cardRef, {
                            depositLimit: card.originalDepositLimit,
                            withdrawLimit: card.originalWithdrawLimit,
                            lastReset: new Date().toISOString()
                        })
                        card.depositLimit = card.originalDepositLimit
                        card.withdrawLimit = card.originalWithdrawLimit
                        card.lastReset = new Date().toISOString()
                    }
                    cardsArray.push(card)
                }
                setCards(cardsArray)
            })
            return () => unsunbscribe() 
        }
    }, [search])

    useEffect(() => {
        const subTotal = cards.reduce((acc, card) => acc + Number(card.amount), 0)
        setTotl(subTotal)
    }, [cards])

    const handleAddPhone = async() => {
        if(!userName || !phone || !amount || !deposit || !withdraw) {
            alert('برجاء ادخال كل البيانات')
        } else {
            await addDoc(collection(db, 'cards'), {
                userName,
                name,
                number,
                phone,
                amount,
                shop,
                depositLimit: deposit,
                withdrawLimit: withdraw,
                originalDepositLimit: deposit,
                originalWithdrawLimit: withdraw,
                lastReset: new Date().toISOString()
            })
            alert("تم اضافة الخط بنجاح")
            setUserName('')
            setNumber('')
            setPhone('')
            setAmount('')
            setWithdraw('')
            setDeposit('')
        }
    }

    const handleDelete = async(id) => {
        await deleteDoc(doc(db, 'cards', id))
    }

    const handleEdit = async(id, userName, phone, amount, number) => {
        setId(id)
        setUserName(userName)
        setPhone(phone)
        setAmount(amount)
        setNumber(number)
        setOpenEdit(true)
    }

    const handleUpdate = async() => {
        await updateDoc(doc(db, 'cards', id), {
            userName,
            phone,
            amount,
            number
        })
        alert('تم التعديل بنجاح')
        setId("")
        setUserName("")
        setPhone("")
        setAmount("")
        setNumber("")
    }

    return (
        <div className="main">
            <div className="boxShadow" style={{display: openEdit ? 'flex' : 'none'}}>
                <div className={styles.editContainer}>
                    <div className={styles.title}>
                        <h2>تعديل الخط</h2>
                        <button onClick={() => setOpenEdit(false)}><IoMdCloseCircleOutline/></button>
                    </div>
                    <div className="inputContainer">
                        <label>اسم المالك :</label>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="ادخل اسم المالك"/>
                    </div>
                    <div className="inputContainer">
                        <label>الرقم القومي :</label>
                        <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ادخل الرقم القومي"/>
                    </div>
                    <div className="inputContainer">
                        <label>رقم الشريحة :</label>
                        <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ادخل الرقم القومي"/>
                    </div>
                    <div className="inputContainer">
                        <label>الرصيد الحالي :</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="اخل الرصيد الحالي للخط"/>
                    </div>
                    <button className={styles.editBtn} onClick={handleUpdate}>تعديل الخط</button>
                </div>
            </div>
            <SideBar/>
            <div className={styles.main}>
                <div className={styles.navigation}>
                    <input list="numbers" type="number" placeholder="ابحث عن الرقم" onChange={(e) => setSearch(e.target.value)} />
                    <datalist id="numbers">
                        {cards.map(card => (
                            <option key={card.id} value={card.phone}/>
                        ))}
                    </datalist>
                    {btns.map((btn, index) => (
                        <button
                            key={index}
                            onClick={() => `${setActive(index)} ${setAdd(index === 1)}`}
                            style={{backgroundColor: active === index ? 'var(--main-color)' : 'var(--black-color)'}}>{btn}</button>
                    ))}
                </div>
                <div className={styles.totalContainer}>
                    <h2>اجمالي الرصيد : {total} جنية</h2>  
                </div>
                <div className={styles.tableContainer} style={{display: add ? 'none' : 'flex'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>التسلسل</th>
                                <th>اسم المالك</th>
                                <th>رقم الخط</th>
                                <th>يمكن ارسال</th>
                                <th>يمكن استقبال</th>
                                <th>الرصيد الحالي</th>
                                <th>الرقم القومي</th>
                                {["محمد شعبان ايرور 3", "محمد شعبان ايرور 2", "محمد شعبان ايرور 1", "admin1"].includes(name) ? 
                                    <th>التفاعل</th>
                                    : 
                                    <></>
                                }
                                
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card, index) => (
                                <tr key={card.id}>
                                    <td>{index + 1}</td>
                                    <td>{card.userName}</td>
                                    <td>{card.phone}</td>
                                    <td>{card.depositLimit}</td>
                                    <td>{Number(card.withdrawLimit - Number(card.amount))}</td>
                                    <td>{card.amount}</td>
                                    <td>{card.number}</td>
                                    {["محمد شعبان ايرور 3", "محمد شعبان ايرور 2", "محمد شعبان ايرور 1", "admin1"].includes(name) ?        
                                    <td className="actions">
                                        <button onClick={() => handleEdit(card.id, card.userName, card.phone, card.amount, card.number)}><FaPen/></button>
                                        <button onClick={() => handleDelete(card.id)}><FaRegTrashAlt/></button>
                                    </td>
                                        :
                                        <></>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {["محمد شعبان ايرور 3", "محمد شعبان ايرور 2", "محمد شعبان ايرور 1", "admin1"].includes(name) ?
                    <div className={styles.addContainer} style={{display: add ? 'flex' : 'none'}}>
                        <div className={styles.inputDiv}>
                            <div className="inputContainer">
                                <label>اسم المالك :</label>
                                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="ادخل اسم المالك"/>
                            </div>
                            <div className="inputContainer">
                                <label>الرقم القومي :</label>
                                <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="ادخل الرقم القومي"/>
                            </div>
                        </div>
                        <div className={styles.inputDiv}>
                            <div className="inputContainer">
                                <label>رقم الشريحة :</label>
                                <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ادخل الرقم القومي"/>
                            </div>
                            <div className="inputContainer">
                                <label>الرصيد الحالي :</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="اخل الرصيد الحالي للخط"/>
                            </div>
                        </div>
                        <div className={styles.inputDiv}>
                            <div className="inputContainer">
                                <label>ليميت الاستلام :</label>
                                <input type="number" value={withdraw} onChange={(e) => setWithdraw(e.target.value)} placeholder="ادخل ليميت الاستلام"/>
                            </div>
                            <div className="inputContainer">
                                <label>ليميت الارسال :</label>
                                <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="ادخل ليميت الارسال"/>
                            </div>
                        </div>
                        <button onClick={handleAddPhone}>اضف الخط</button>
                    </div>
                    :
                    <></>
                }
            </div>
        </div>
    )
}

export default Cards;
