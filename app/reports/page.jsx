'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import SideBar from "@/components/SideBar/page";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

function Reports() {
    const [selectedDate, setSelectedDate] = useState("");
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0)

    useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    }, []);


    useEffect(() => {
        const fetchReportsByDate = async () => {
            if (!selectedDate) return;
            const q = query(collection(db, "reports"), where("date", "==", selectedDate));
            const querySnapshot = await getDocs(q);
            const reportsArray = [];
            querySnapshot.forEach((doc) => {
            reportsArray.push({ ...doc.data(), id: doc.id });
            });

            setReports(reportsArray);
        };

        fetchReportsByDate();
    }, [selectedDate]);

    useEffect(() => {
        const subTotal = reports.reduce((acc, report) => {
            return acc + Number(report.commation)
        }, 0)
        setTotal(subTotal)
    }, [reports])


    return(
        <div className="main">
            <SideBar/>
            <div className={styles.reportsContainer}>
                <div className="inputContainer">
                    <label>تاريخ التقرير : </label>
                    <input type="date" onChange={(e) => setSelectedDate(e.target.value)}/>
                </div>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>الرقم الستخدم</th>
                                <th>نوع العملية</th>
                                <th>المبلغ</th>
                                <th>العمولة</th>
                                <th>اجمالي المبلغ</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => {
                                return(
                                        <tr key={report.id}>
                                            <td>{report.phone}</td>
                                            <td>{report.type}</td>
                                            <td>{report.amount}</td>
                                            <td>{report.commation}</td>
                                            <td>{Number(report.amount) - Number(report.commation)}</td>
                                            <td>{report.date}</td>
                                        </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={1}>صافي ربح اليوم : {total} جنية</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Reports;