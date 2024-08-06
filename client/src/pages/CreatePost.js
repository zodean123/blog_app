export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        ev.preventDefault();

        const data = new FormData();
        data.set('title', title);
        data.set('content', content);
        data.set('summary', summary);
        data.set('file', files[0]);

        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/post`, {
            method: 'POST',
            body: data,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <>
            <div className="post-div">
                <form className="CreatePost" onSubmit={createNewPost}>
                    <h1>Create a New Post</h1>
                    <input type="title" placeholder={'Title'} value={title} onChange={ev => setTitle(ev.target.value)} />
                    <input type="summary" placeholder="Summary" value={summary} onChange={ev => setSummary(ev.target.value)} />
                    <input type="file" placeholder='File' onChange={ev => setFiles(ev.target.files)} />
                    <Editor value={content} onChange={setContent} />
                    <button className="PostButton">Create Post</button>
                </form>
            </div>
        </>
    )
}