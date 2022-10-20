import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { AppContext } from '../App';

export function Message({ message }) {
    const [showEdit, setShowEdit] = useState(false);
    const [editValue, setEditValue] = useState('');
    const { user } = useContext(AppContext);

    useEffect(() => {
        setEditValue(message.content);
    }, [message]);

    const handleSubmit = (evt) => {
        evt.preventDefault();
        fetch('http://localhost:5000/messages/' + message.id, {
            method: 'PUT',
            headers: {
                Authorization: `bearer token ${user}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: editValue }),
        }).then(() => setShowEdit(false));
    };

    const handleDelete = () => {
        fetch('http://localhost:5000/messages/' + message.id, {
            method: 'DELETE',
            headers: {
                Authorization: `bearer token ${user}`,
            },
        });
    };

    return (
        <div style={{ margin: '0 1rem' }}>
            <div className="flex">
                <h4
                    style={{
                        margin: '0.25rem',
                        marginLeft: 0,
                    }}
                >
                    {message.user.username},{' '}
                    {new Date(message.created_at).toDateString()}:
                </h4>{' '}
            </div>

            <div className="flex">
                {message.content}{' '}
                <div style={{ marginLeft: 'auto' }}>
                    <button onClick={handleDelete}>delete</button>
                    <button onClick={() => setShowEdit(!showEdit)}>edit</button>
                </div>
            </div>
            {showEdit && (
                <form onSubmit={handleSubmit}>
                    <input
                        style={{ width: '100%' }}
                        value={editValue}
                        onChange={(evt) => setEditValue(evt.target.value)}
                    ></input>
                </form>
            )}
        </div>
    );
}
