export default function Listener({listener}){
    return (
        <div>
            <ul>
                <li>User ID: <span id="id">{listener.id}</span></li>
                <li>Email: <span id="email">{listener.email}</span></li>
                <li>Spotify URI: <a id="uri" href="#">{listener.uri}</a></li>
                <li>Link: <a id="url" href="#">{listener.link}</a></li>
            </ul>   
        </div>
    )
}