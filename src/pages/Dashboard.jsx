import { useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";
import { QRCodeCanvas } from "qrcode.react";
import QRScanner from "../components/QRScanner";

function Dashboard() {
    // UI Navigation & View States
    const [activeTab, setActiveTab] = useState("overview");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Wallet & User Data States
    const [balance, setBalance] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [receiverEmail, setReceiverEmail] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawals, setWithdrawals] = useState([]);
    const [showScanner, setShowScanner] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Lifecycle Hook
    useEffect(() => {
        fetchBalance();
        fetchHistory();
        fetchProfile();
        fetchStats();
        fetchWithdrawals();
        fetchNotifications();
    }, []);

    // API Integration Methods
    const fetchStats = async () => {
        try {
            const response = await api.get("/wallet/stats");
            setStats(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const changePassword = async () => {
        try {
            await api.post("/user/change-password", { currentPassword, newPassword });
            alert("Password Changed Successfully");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            console.log(error);
            alert("Current Password Incorrect");
        }
    };

    const requestWithdrawal = async () => {
        if (Number(withdrawAmount) <= 0) {
            alert("Enter valid amount");
            return;
        }
        try {
            await api.post("/wallet/withdraw", { amount: Number(withdrawAmount) });
            alert("Withdrawal Request Submitted");
            setWithdrawAmount("");
            fetchWithdrawals();
            fetchNotifications();
        } catch (error) {
            console.log(error);
            alert("Request Failed");
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await api.get("/user/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchBalance = async () => {
        try {
            const response = await api.get("/wallet/balance");
            setBalance(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const downloadStatement = async () => {
        try {
            const response = await api.get("/user/statement", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "statement.pdf");
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.log(error);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const response = await api.get("/wallet/withdrawals");
            setWithdrawals(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await api.get("/user/profile");
            setProfile(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const transferMoney = async () => {
        if (Number(transferAmount) <= 0) {
            alert("Amount must be greater than zero");
            return;
        }
        if (!receiverEmail) {
            alert("Receiver email is required");
            return;
        }
        try {
            await api.post("/wallet/transfer", { receiverEmail, amount: Number(transferAmount) });
            alert("Transfer Successful");
            setReceiverEmail("");
            setTransferAmount("");
            fetchBalance();
        } catch (error) {
            console.log(error);
            alert("Transfer Failed");
        }
        fetchBalance();
        fetchHistory();
        fetchStats();
        fetchNotifications();
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get("/wallet/history");
            setTransactions(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setIsSidebarOpen(false); // Auto-closes mobile overlay drawers
    };

    return (
        <div className="dashboard-container">
            {/* Mobile Sidebar Overlay Dim Backdrop */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar Navigation */}
            <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <div className="sidebar-brand">
                    <h2>Digital Wallet</h2>
                    <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>×</button>
                </div>
                <nav className="sidebar-menu">
                    <button className={activeTab === "overview" ? "active" : ""} onClick={() => handleTabChange("overview")}>Overview</button>
                    <button className={activeTab === "transfer" ? "active" : ""} onClick={() => handleTabChange("transfer")}>Transfer & Scan</button>
                    <button className={activeTab === "withdraw" ? "active" : ""} onClick={() => handleTabChange("withdraw")}>Withdrawals</button>
                    <button className={activeTab === "history" ? "active" : ""} onClick={() => handleTabChange("history")}>History</button>
                    <button className={activeTab === "settings" ? "active" : ""} onClick={() => handleTabChange("settings")}>Settings</button>
                </nav>
                <button onClick={logout} className="logout-btn">Logout</button>
            </aside>

            {/* Main Application Window */}
            <main className="main-content">
                {/* Responsive Core Header */}
                <header className="top-header">
                    <div className="header-left">
                        <button className="hamburger-menu" onClick={() => setIsSidebarOpen(true)}>
                             ☰
                        </button>
                        <div className="user-welcome">
                            {profile && <h2>Welcome back, <span>{profile.name}</span></h2>}
                        </div>
                    </div>
                    <button onClick={downloadStatement} className="download-btn">
                        Download Statement
                    </button>
                </header>

                <div className="tab-content">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="tab-pane">
                            <div className="overview-grid">
                                <div className="balance-card">
                                    <h3>Current Balance</h3>
                                    <h1>₹{balance}</h1>
                                </div>
                                {stats && (
                                    <>
                                        <div className="stat-card">
                                            <h3>Total Deposits</h3>
                                            <h2>₹{stats.totalDeposits}</h2>
                                        </div>
                                        <div className="stat-card">
                                            <h3>Total Transfers</h3>
                                            <h2>₹{stats.totalTransfers}</h2>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="two-column-layout">
                                <div className="qr-card">
                                    <h3>My Wallet QR</h3>
                                    {profile && (
                                        <div className="qr-wrapper">
                                            <QRCodeCanvas value={profile.email} size={180} level="H" />
                                            <p className="qr-email">{profile.email}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="notifications-card">
                                    <h3>Notifications</h3>
                                    <div className="notifications-list">
                                        {notifications.length === 0 ? (
                                            <p className="no-data">No notifications</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className="notification-item">
                                                    <p>{n.message}</p>
                                                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TRANSFER & QR SCANNING */}
                    {activeTab === "transfer" && (
                        <div className="tab-pane single-card-layout">
                            <div className="card action-card">
                                <h3>Transfer Money</h3>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        placeholder="Receiver Email"
                                        value={receiverEmail}
                                        onChange={(e) => setReceiverEmail(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount (₹)"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                    />
                                </div>
                                <div className="action-buttons">
                                    <button onClick={transferMoney} className="btn-primary">Transfer Now</button>
                                    <button onClick={() => setShowScanner(true)} className="btn-secondary">Scan QR Code</button>
                                </div>
                                {showScanner && (
                                    <div className="scanner-modal">
                                        <div className="scanner-container">
                                            <QRScanner
                                                onScan={(email) => {
                                                    setReceiverEmail(email);
                                                    setShowScanner(false);
                                                    alert("QR Scanned");
                                                }}
                                            />
                                            <button onClick={() => setShowScanner(false)} className="btn-close">Close Scanner</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: WITHDRAWALS */}
                    {activeTab === "withdraw" && (
                        <div className="tab-pane layout-split">
                            <div className="card action-card">
                                <h3>Request Withdrawal</h3>
                                <input
                                    type="number"
                                    placeholder="Enter Amount (₹)"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                />
                                <button onClick={requestWithdrawal} className="btn-primary">Submit Request</button>
                            </div>

                            <div className="table-card">
                                <h3>Withdrawal History</h3>
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {withdrawals.length === 0 ? (
                                                <tr><td colSpan="4" className="no-data">No history found</td></tr>
                                            ) : (
                                                withdrawals.map((w) => (
                                                    <tr key={w.id}>
                                                        <td>{w.id}</td>
                                                        <td>₹{w.amount}</td>
                                                        <td><span className={`status-badge ${w.status.toLowerCase()}`}>{w.status}</span></td>
                                                        <td>{new Date(w.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: TRANSACTION HISTORY */}
                    {activeTab === "history" && (
                        <div className="tab-pane">
                            <div className="table-card full-width">
                                <h3>Transaction History</h3>
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Sender</th>
                                                <th>Receiver</th>
                                                <th>Date & Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.length === 0 ? (
                                                <tr><td colSpan="7" className="no-data">No transactions registered</td></tr>
                                            ) : (
                                                transactions.map((t) => (
                                                    <tr key={t.id}>
                                                        <td>{t.id}</td>
                                                        <td><span className={`type-badge ${t.type.toLowerCase()}`}>{t.type}</span></td>
                                                        <td className={t.type === "DEPOSIT" ? "text-success" : "text-danger"}>₹{t.amount}</td>
                                                        <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                                                        <td>{t.senderEmail || "-"}</td>
                                                        <td>{t.receiverEmail || "-"}</td>
                                                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: SETTINGS */}
                    {activeTab === "settings" && (
                        <div className="tab-pane layout-split">
                            {profile && (
                                <div className="card profile-info-card">
                                    <h3>Account Details</h3>
                                    <div className="profile-detail-row"><strong>Name:</strong> <span>{profile.name}</span></div>
                                    <div className="profile-detail-row"><strong>Email:</strong> <span>{profile.email}</span></div>
                                    <div className="profile-detail-row"><strong>Account Role:</strong> <span>{profile.role}</span></div>
                                </div>
                            )}

                            <div className="card action-card">
                                <h3>Change Password</h3>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button onClick={changePassword} className="btn-primary">Update Password</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;