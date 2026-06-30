import { useState } from "react";
import api from "../services/api";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
import { Link } from "react-router-dom";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

    const token =
        localStorage.getItem("token");

    if (token) {
        navigate("/dashboard");
    }

    }, []);

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            alert("Login Successful");

            navigate("/dashboard");

        } catch (error) {

            console.log(error);

            alert("Invalid Credentials");
        }
    };

    return (
    <div className="login-container">

        <div className="login-card">

            <h2>Digital Wallet Login</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <button type="submit">
                    Login
                </button>
                <p>
                    Don't have an account?
                    <Link to="/register">
                        {" "}Register
                    </Link>
                </p>

            </form>

        </div>

    </div>
);
}

export default Login;