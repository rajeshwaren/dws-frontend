import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminDashboard.css"

function AdminDashboard() {

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [email, setEmail] = useState("");
    const [amount, setAmount] = useState("");
    const [withdrawals, setWithdrawals] = useState([]);

    useEffect(() => {

        fetchStats();
        fetchUsers();
        fetchTransactions();
        fetchWithdrawals();

    }, []);
    const rejectWithdrawal =
async (id) => {

    try {

        await api.post(
            `/admin/withdrawals/reject/${id}`
        );

        alert("Rejected");

        fetchWithdrawals();

    } catch (error) {

        console.log(error);
    }
};
    const approveWithdrawal =
async (id) => {

    try {

        await api.post(
            `/admin/withdrawals/approve/${id}`
        );

        alert("Approved");

        fetchWithdrawals();
        fetchUsers();
        fetchStats();

    } catch (error) {

        console.log(error);
    }
};
    const fetchWithdrawals = async () => {

    try {

        const response =
            await api.get(
                "/admin/withdrawals"
            );

        setWithdrawals(
            response.data
        );

    } catch (error) {

        console.log(error);
    }
};
    const fetchStats = async () => {

        const response =
            await api.get("/admin/stats");

        setStats(response.data);
    };
    const freezeUser = async (id) => {

    await api.post(
        `/admin/freeze/${id}`
    );

    fetchUsers();
};
const unfreezeUser = async (id) => {

    await api.post(
        `/admin/unfreeze/${id}`
    );

    fetchUsers();
};

    const fetchUsers = async () => {

        const response =
            await api.get("/admin/users");

        setUsers(response.data);
    };

    const fetchTransactions = async () => {

        const response =
            await api.get("/admin/transactions");

        setTransactions(response.data);
    };
    const addMoney = async () => {

        try {

            await api.post(
                "/admin/add-money",
                {
                    email,
                    amount: Number(amount)
                }
            );

            alert("Money Added Successfully");

            setEmail("");
            setAmount("");

            fetchStats();
            fetchUsers();
            fetchTransactions();

        } catch (error) {

            console.log(error);

            alert("Failed");
        }
    };

    return (
    <div className="dashboard">

        <h1 className="title">Admin Dashboard</h1>

        {/* STATS */}
        {stats && (
            <div className="stats-grid">

                <div className="card stat-card">
                    <h3>Total Users</h3>
                    <h2>{stats.totalUsers}</h2>
                </div>

                <div className="card stat-card">
                    <h3>Total Transactions</h3>
                    <h2>{stats.totalTransactions}</h2>
                </div>

                <div className="card stat-card">
                    <h3>Total Money</h3>
                    <h2>₹{stats.totalMoney}</h2>
                </div>

            </div>
        )}

        {/* ADD MONEY */}
        <div className="card action-card">

            <h2>Add Money</h2>

            <input
                type="email"
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <button onClick={addMoney}>
                Add Money
            </button>

        </div>

        {/* USERS */}
        <h2 className="section-title">Users</h2>

        <div className="table-card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>₹{user.balance}</td>
                            <td>{user.status}</td>
                            <td>
    {user.status === "ACTIVE" ? (

        <button
            onClick={() =>
                freezeUser(user.id)
            }
        >
            Freeze
        </button>

    ) : (

        <button
            onClick={() =>
                unfreezeUser(user.id)
            }
        >
            Unfreeze
        </button>

    )}
</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <h2 className="section-title">
    Withdrawal Requests
</h2>

<div className="table-card">

    <table>

        <thead>
            <tr>

                <th>ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>

            </tr>
        </thead>

        <tbody>

            {withdrawals.map((w) => (

                <tr key={w.id}>

                    <td>{w.id}</td>

                    <td>{w.userEmail}</td>

                    <td>₹{w.amount}</td>

                    <td>{w.status}</td>

                    <td>

                        {w.status ===
                        "PENDING" ? (

                            <>
                            <div className="btn-g">

                                <button className="approve-btn"
                                    onClick={() =>
                                        approveWithdrawal(
                                            w.id
                                        )
                                    }
                                >
                                    Approve
                                </button>

                                <button className="reject-btn"
                                    onClick={() =>
                                        rejectWithdrawal(
                                            w.id
                                        )
                                    }
                                >
                                    Reject
                                </button>
                            </div>

                            </>

                        ) : (

                            w.status

                        )}

                    </td>

                </tr>

            ))}

        </tbody>

    </table>

</div>
        {/* TRANSACTIONS */}
        <h2 className="section-title">Transactions</h2>

        <div className="table-card">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Sender</th>
                        <th>Receiver</th>
                    </tr>
                </thead>

                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.id}</td>
                            <td>{tx.type}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.senderEmail}</td>
                            <td>{tx.receiverEmail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    </div>
);
}

export default AdminDashboard;