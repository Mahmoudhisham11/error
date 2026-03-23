'use client';
import SideBar from "@/components/SideBar/page";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaTrashAlt } from "react-icons/fa";

function Sittings() {
    const btns = ['المستخدمين', 'الصلاحيات']
    const [users, setUsers] = useState([])
    const [permissions, setPermissions] = useState({
    cards: false,
    reports: false,
    sittings: false,
     });
    const [selectedUser, setSelectedUser] = useState(null);
    const [active, setActive] = useState(0)

    useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setUsers(allUsers);
    });

    return () => unsubscribe();
  }, []);

    const handleSelectUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (user) {
        setSelectedUser(user);
        setPermissions(user.permissions || {});
        setActive(user.active ?? true);
        }
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        const userRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userRef, {
        permissions,
        active,
        });
        alert('تم تحديث صلاحيات المستخدم بنجاح');
    };

    const handleDelete = async(id) => {
        await deleteDoc(doc(db, 'users', id))
    }

    return(
        <div className="main">
            <SideBar/>
            <div className={styles.sittingsContainer}>
                <div className={styles.btnsContainer}>
                    {btns.map((btn, index) => {
                        return(
                            <button onClick={() => setActive(index)} key={index} style={{backgroundColor: active === index ? 'var(--main-color)' : 'var(--black-color)'}}>{btn}</button>
                        )
                    })}
                </div>
                <div className={styles.usersContainer} style={{display: active === 0 ? 'flex' : 'none'}}>
                    <table>
                        <thead>
                            <tr>
                                <th>اسم المستخدم</th>
                                <th>اسم الفرع</th>
                                <th>حذف</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                return(
                                    <tr key={user.id}>
                                        <td>{user.userName}</td>
                                        <td>{user.shop}</td>
                                        <td className="actions">
                                            <button onClick={() => handleDelete(user.id)}><FaTrashAlt/></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className={styles.premissionContainer} style={{display: active === 1 ? 'block' : 'none'}}>
                    <div className={styles.container}>
                        <div className="inputContainer">
                            <label>اسم المستخدم :</label>
                            <select onChange={(e) => handleSelectUser(e.target.value)}>
                                <option value="">-- اختر --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.userName}</option>
                                ))}
                            </select>
                        </div>
                    {selectedUser && (
                        <div className= {styles.content}>
                            <h3>صلاحيات المستخدم: {selectedUser.userName}</h3>
                            <label>
                                <input
                                type="checkbox"
                                checked={permissions.cards}
                                onChange={(e) => setPermissions({ ...permissions, cards: e.target.checked })}
                                />
                                صفحة الخطوط
                            </label>
                            <br/>
                            <label>
                                <input
                                type="checkbox"
                                checked={permissions.reports}
                                onChange={(e) => setPermissions({ ...permissions, reports: e.target.checked })}
                                />
                                صفحة التقارير
                            </label>
                            <br/>
                            <label>
                                <input
                                type="checkbox"
                                checked={permissions.sittings}
                                onChange={(e) => setPermissions({ ...permissions, sittings: e.target.checked })}
                                />
                                صفحة الإعدادات
                            </label>
                            <br/>
                            <button className={styles.saveBtn} onClick={handleSave}>حفظ التعديلات</button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sittings;