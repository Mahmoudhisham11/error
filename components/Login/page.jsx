'use client';
import styles from "./styles.module.css";
import Image from "next/image";
import logo from "../../public/images/logo.png"
import { useState, useEffect } from "react";
import { db } from "@/app/firebase";
import { addDoc, collection, doc, getDocs, query, where } from "firebase/firestore";

function Login() {
    const [active, setActive] = useState(false)
    const [userName, setUserName] = useState('')
    const [password, setPassword] =  useState('')
    const [shop, setShop] = useState('')

    // CREATE ACCOUNT FUNCTION 
    const handleCreatAcc = async() => {
        if(!userName) {
            alert("يجب ادخال اسم المستخدم")
            return
        }
        if(!password) {
            alert("يجب ادخال كلمة المرور")
            return
        }
        if(!shop) {
            alert("يجب ادخال اسم المحل")
            return
        }
        const q = query(collection(db, 'users'), where('userName', '==', userName.toLowerCase().trim()))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.empty) {
            await addDoc(collection(db, 'users'), {
                userName: userName.toLowerCase().trim(),
                 password, 
                 shop,
                 permissions: {cards: false, reports: false, active: false, sittings: false}
                })
            alert("تم انشاء حساب للمستخدم")
            setUserName('')
            setPassword('')
            setShop('')
        }else {
            alert('المستخدم موجود بالفعل')
        }
    }
    useEffect(() => {
    const checkUserActiveStatus = async () => {
        const savedUserName = localStorage.getItem("userName");
        const savedShop = localStorage.getItem("shop");

        if (!savedUserName || !savedShop) return;

        try {
            const q = query(
                collection(db, "users"),
                where("userName", "==", savedUserName.toLowerCase().trim())
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                // تحقق من shop
                if (userData.shop.toLowerCase().trim() !== savedShop.toLowerCase().trim()) {
                    localStorage.clear();
                    window.location.reload();
                    return;
                }

                // تحقق من active
                if (userData.permissions?.active !== true) {
                    alert("تم تعطيل الحساب");
                    localStorage.clear();
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Error checking user active status:", error);
        }
    };

    checkUserActiveStatus();
}, []);


    // HANDLE LOGIN FUNCTION
    const handleLogin = async () => {
        if (!userName) {
            alert("يجب ادخال اسم المستخدم");
            return;
        }
        if (!password) {
            alert("يجب ادخال كلمة المرور");
            return;
        }
        if (!shop) {
            alert("يجب ادخال اسم المحل");
            return;
        }

        try {
            // التأكد من وجود المستخدم
            const q = query(
            collection(db, "users"),
            where("userName", "==", userName.toLowerCase().trim())
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
            alert("اسم المستخدم غير صحيح");
            return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // التأكد من كلمة المرور
            if (userData.password !== password) {
            alert("كلمة المرور غير صحيحة");
            return;
            }

            // التأكد من وجود shop مطابق
            if (userData.shop.toLowerCase().trim() !== shop.toLowerCase().trim()) {
            alert("اسم المحل غير صحيح أو لا يطابق اسم المحل المرتبط بالحساب");
            return;
            }

            // التحقق من حالة التفعيل
            if (userData.permissions?.active !== true) {
            alert("تم تعطيل الحساب، برجاء التواصل مع المطور");
            localStorage.clear(); // تسجيل خروج
            if (typeof window !== "undefined") {
                window.location.reload();
            }
            return;
            }

            // حفظ البيانات في localStorage
            if (typeof window !== "undefined") {
            localStorage.setItem("userName", userName);
            localStorage.setItem("shop", shop);
            window.location.reload();
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("حدث خطأ أثناء تسجيل الدخول");
        }
    };


    return(
        <div className={styles.loginContainer}>
            <div className={styles.imageContainer}>
                <Image src={logo} alt="logo Image" className={styles.logoImage}/>
            </div>
            <div className={styles.loginContent}>
                <div className={styles.loginInfo} style={{display: active ? "none" : "flex"}}>
                    <div className={styles.title}>
                        <h2>مرحبا بعودتك</h2>
                        <p>برجاء ادخال بياناتك لتسجيل الدخول</p>
                    </div>
                    <div className={styles.inputs}>
                        <div className="inputContainer">
                            <label> اسم المستخدم : </label>
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="برجاء ادخال اسم المستخدم"/>
                        </div>
                        <div className="inputContainer">
                            <label> كلمة المرور : </label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="برجاء ادخال كلمة المرور"/>
                        </div>
                        <div className="inputContainer">
                            <label> اسم الفرع : </label>
                            <input type="text" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="برجاء ادخال اسم الفرع"/>
                        </div>
                        <button className={styles.loginBtn} onClick={handleLogin}>تسجيل الدخول</button>
                        <button className={styles.creatBtn} onClick={() => setActive(true)}>ليس لديك حساب؟ <span>انشاء حساب جديد</span></button>
                    </div>
                </div>
                <div className={styles.loginInfo} style={{display: active ? "flex" : "none"}}>
                    <div className={styles.title}>
                        <h2>اهلا بك</h2>
                        <p>برجاء ادخال بياناتك لانشاء حساب جديد</p>
                    </div>
                    <div className={styles.inputs}>
                        <div className="inputContainer">
                            <label> اسم المستخدم : </label>
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="برجاء ادخال اسم المستخدم"/>
                        </div>
                        <div className="inputContainer">
                            <label> كلمة المرور : </label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="برجاء ادخال كلمة المرور"/>
                        </div>
                        <div className="inputContainer">
                            <label> اسم الفرع : </label>
                            <input type="text" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="برجاء ادخال اسم الفرع"/>
                        </div>
                        <button className={styles.loginBtn} onClick={handleCreatAcc}>انشاء حساب</button>
                        <button className={styles.creatBtn} onClick={() => setActive(false)}>  لديك حساب بالفعل؟ <span>تسجيل الدخول</span></button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login;