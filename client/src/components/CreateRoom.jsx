import { useContext, useState } from 'react';
import { AppContext } from '../App';

export function CreateRoom() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const { user, rooms, dispatch } = useContext(AppContext);

    const handleCreation = (evt) => {
        evt.preventDefault();
        fetch('http://localhost:5000/rooms/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `bearer token ${user}`,
            },
            body: JSON.stringify({ name, password }),
        })
            
    };

    return (
        <form className="flex column" onSubmit={handleCreation}>
            <h2>Create new room</h2>
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
