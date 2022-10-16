import { useContext, useState } from 'react';
import { AppContext } from '../App';

export function JoinRoom() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const { user } = useContext(AppContext);

    const handleCreation = (evt) => {
        evt.preventDefault();
        fetch('http://localhost:5000/rooms/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `bearer token ${user}`,
            },
            body: JSON.stringify({ name, password }),
        }).then(() => {
            setName('');
            setPassword('');
        });
    };

    return (
        <form className="flex column" onSubmit={handleCreation}>
            <h2>Join room</h2>
            <label>
                Name
                <input
                    value={name}
                    onChange={(evt) => setName(evt.target.value)}
                />
            </label>
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
    );
}
