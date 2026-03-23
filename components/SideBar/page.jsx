  'use client';
  import styles from "./styles.module.css";
  import Image from "next/image";
  import logo from "../../public/images/logo.png"
  import Link from "next/link";
  import { TbMoneybag } from "react-icons/tb";
  import { BiMemoryCard } from "react-icons/bi";
  import { TbReportSearch } from "react-icons/tb";
  import { RiLogoutCircleLine } from "react-icons/ri";
  import { GoGear } from "react-icons/go";
  import { useEffect, useState } from "react";
  import { collection, onSnapshot, query } from "firebase/firestore";
  import { db } from "@/app/firebase";

  function SideBar() {
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [userName, setUserName] = useState('');

    useEffect(() => {
      const storageUser = localStorage.getItem("userName");
      if (storageUser) {
        setUserName(storageUser);
        console.log("👤 userName from storage:", storageUser);
      }

      const q = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userArray = [];
        querySnapshot.forEach((doc) => {
          userArray.push({ ...doc.data(), id: doc.id });
        });
        setUsers(userArray);
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (users.length > 0 && userName) {
        const currentUser = users.find(
          user => user.userName?.toLowerCase() === userName.toLowerCase()
        );
        if (currentUser && currentUser.permissions) {
          console.log("✅ currentUser:", currentUser);
          setPermissions(currentUser.permissions);
        }
      }
    }, [users, userName]);

    const links = [
      {
        key: 'home',
        href: '/',
        label: 'المبيعات اليومية',
        icon: <TbMoneybag />,
        alwaysVisible: true
      },
      {
        key: 'cards',
        href: '/cards',
        label: 'الخطوط',
        icon: <BiMemoryCard />
      },
      {
        key: 'reports',
        href: '/reports',
        label: 'التقارير',
        icon: <TbReportSearch />
      },
      {
        key: 'sittings',
        href: '/sittings',
        label: 'الإعدادات',
        icon: <GoGear />
      }
    ];

    const handleLogout = () => {
      const confirmDelete = window.confirm("هل تريد تسجيل الخروج");
      if (!confirmDelete) return;
      if(typeof window !== 'undefined') {
        localStorage.clear()
        window.location.reload()
      }
    }

    return (
      <div className={styles.sideBarContainer}>
        <div className={styles.logoContianer}>
          <Image src={logo} fill style={{ objectFit: "cover" }} alt="logo image" />
        </div>

        <div className={styles.controles}>
          {links.map(link => (
            (link.alwaysVisible || permissions[link.key]) && (
              <Link href={link.href} key={link.key} className={styles.btn}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            )
          ))}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span><RiLogoutCircleLine/></span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    );
  }

  export default SideBar;
