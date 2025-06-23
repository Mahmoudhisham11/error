'use client';
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
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
            }else {
                 q = query(collection(db, 'cards'), where('shop', '==', storageShop))
            }
            const unsunbscribe = onSnapshot(q, (querySnapshot) => {
                const cardsArray = []
                querySnapshot.forEach((doc) => {
                    cardsArray.push({...doc.data(), id: doc.id})
                })
                setCards(cardsArray)
            })
            return () => unsunbscribe() 
        }
    }, [search])

    const handleAddPhone = async() => {
        if(!userName && !number && !phone && !amount) {
            alert('برجاء اخال كل البيانات')
        }else {
            await addDoc(collection(db, 'cards'), {
                userName,
                name,
                number,
                phone,
                amount,
                shop,
                depositLimit: deposit,
                withdrawLimit: withdraw,
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

    // HANDLE DELETE CARD 
    const handleDelete = async(id) => {
        await deleteDoc(doc(db, 'cards', id))
    }
    
    // HANDLE EDIT CARD 
    const handleEdit = async(id, userName, phone, amount, number) => {
        setId(id)
        setUserName(userName)
        setPhone(phone)
        setAmount(amount)
        setNumber(number)
        setOpenEdit(true)
    }

    // HANDLE UPDATE CARD
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

    return(
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
                        {cards.map(card => {
                            return(
                                <option key={card.id} value={card.phone}/>
                            )
                        })}
                    </datalist>
                    {btns.map((btn, index) => {
                        return(
                            <button key={index} onClick={() => `${setActive(index)} ${setAdd(index === 0 ? false : true)}`} style={{backgroundColor: active === index ? 'var(--main-color)' : 'var(--black-color)'}} >{btn}</button>
                        )
                    })}
                </div>
                <div className={styles.tableContainer} style={{display: add ? 'none' : 'flex'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>اسم المالك</th>
                                <th>رقم الخط</th>
                                <th>يمكن ارسال</th>
                                <th>يمكن استقبال</th>
                                <th>الرصيد الحالي</th>
                                <th>الرقم القومي</th>
                                <th>التفاعل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map(card => {
                                return(
                                    <tr key={card.id}>
                                        <td>{card.userName}</td>
                                        <td>{card.phone}</td>
                                        <td>{card.depositLimit}</td>
                                        <td>{Number(card.withdrawLimit - Number(card.amount))}</td>
                                        <td>{card.amount}</td>
                                        <td>{card.number}</td>
                                        <td className="actions">
                                            <button onClick={() => handleEdit(card.id, card.userName, card.phone, card.amount, card.number)}><FaPen/></button>
                                            <button onClick={() => handleDelete(card.id)}><FaRegTrashAlt/></button>
                                        </td>
                                    </tr>
                                )
                            })}

                        </tbody>
                    </table>
                </div>
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
            </div>
        </div>
    )
}

export default Cards;