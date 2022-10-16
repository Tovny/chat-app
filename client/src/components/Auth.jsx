import { useContext } from 'react';
import { useState } from 'react';
import { AppContext } from '../App';

export function Auth() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRegister, setShowRegister] = useState(false);

    const { setUser } = useContext(AppContext);

    const handleLogin = async () => {
        fetch('http://localhost:5000/login/', {
            method: 'POST',
            body: { username, password },
        }).then((token) => {
            console.log(token);
            // setUser(token);
            // console.log(token);
        });
    };

    const handleRegister = async () => {
        fetch('http://localhost:5000/register', {
            method: 'POST',
            body: { username, password, email },
        }).then(() => {
            setShowRegister(false);
        });
    };

    return (
        <div className="flex column">
            <form
                className="flex column"
                onSubmit={(evt) => {
                    evt.preventDefault();
                    showRegister ? handleRegister() : handleLogin();
                }}
            >
                <h1>{showRegister ? 'Register' : 'Login'}</h1>
                <label>
                    Username
                    <input
                        value={username}
                        onChange={(evt) => setUsername(evt.target.value)}
                    />
                </label>
                {showRegister && (
                    <label>
                        Email
                        <input
                            value={email}
                            type="email"
                            onChange={(evt) => setEmail(evt.target.value)}
                        />
                    </label>
                )}
                <label>
                    Password{' '}
                    <input
                        value={password}
                        type="password"
                        onChange={(evt) => setPassword(evt.target.value)}
                    />
                </label>
                <button type="submit">Submit</button>
            </form>
            <button onClick={() => setShowRegister(!showRegister)}>
                {showRegister ? 'Show login' : 'Show register'}
            </button>
        </div>
    );
}
