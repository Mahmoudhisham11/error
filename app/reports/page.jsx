'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import SideBar from "@/components/SideBar/page";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

function Reports() {
  const [selectedDate, setSelectedDate] = useState("");
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageShop = localStorage.getItem("shop");

      const fetchReportsByDate = async () => {
        if (!selectedDate || !storageShop) return;

        const q = query(
          collection(db, "reports"),
          where("date", "==", selectedDate),
          where("shop", "==", storageShop)
        );

        const querySnapshot = await getDocs(q);
        const reportsArray = [];

        querySnapshot.forEach((doc) => {
          reportsArray.push({ ...doc.data(), id: doc.id });
        });

        setReports(reportsArray);
      };

      fetchReportsByDate();
    }
  }, [selectedDate]);

  useEffect(() => {
    const subTotal = reports.reduce((acc, report) => {
      return acc + Number(report.commation || 0);
    }, 0);
    setTotal(subTotal);
  }, [reports]);

  return (
    <div className="main">
      <SideBar />
      <div className={styles.reportsContainer}>
        <div className="inputContainer">
          <label>تاريخ التقرير : </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button onClick={() => window.print()}>حفظ PDF</button>
        </div>

        <div className={styles.tableContainer}>
          {reports.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              لا توجد تقارير في هذا التاريخ.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>الرقم المستخدم</th>
                  <th>نوع العملية</th>
                  <th>المبلغ</th>
                  <th>العمولة</th>
                  <th>اجمالي المبلغ</th>
                  <th>اسم العميل</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.phone}</td>
                    <td>{report.type}</td>
                    <td>{report.amount}</td>
                    <td>{report.commation || 0}</td>
                    <td>{Number(report.amount || 0) - Number(report.commation || 0)}</td>
                    <td>{report.name}</td>
                    <td>{report.date}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={7}>صافي ربح اليوم : {total} جنية</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
