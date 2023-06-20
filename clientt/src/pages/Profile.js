import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Profile() {
    const [data, setdata] = useState(JSON.parse(localStorage.getItem('profile')))
    const [isfollow, setisfollow] = useState(data.followers.includes(localStorage.getItem('userid')));
    const [follolenght, setfollolenght] = useState(data.followers.length);
    const [profilephoto, setprofilephoto] = useState();
    const navigate = useNavigate();
    const [replytweet, setreplytweet] = useState();
    const [content, setreply] = useState('');
    const [ismsg, setismsg] = useState(false);
    const [alltweets, setalltweets] = useState([]);
    const [msg, setmsg] = useState('');
    const [isedit, setisedit] = useState(false);
    const [eddetails, seteddetails] = useState({ name: '', location: '', dob: '' });
    // filter the tweets post by us
    const ourtweets = alltweets.filter(ourtweet => ourtweet.tweetedby._id === data._id);
    const editHandler = (e) => {
        seteddetails({ ...eddetails, [e.target.name]: e.target.value });
    }
    //request the server to change the extra information of the user
    const editsubmithandleer = async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:5000/api/user/${localStorage.getItem('userid')}`, eddetails, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
            setmsg(res.data);
            toast(res.data);
            refresh();
        });
        setisedit(prev => !prev)
        function refresh() {
            axios.get(`http://localhost:5000/api/user/${data._id}`, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
                setdata(res.data);
                localStorage.setItem("profile", JSON.stringify(res.data));
                return navigate('/profile');
            });
        }
    }
    //request the server to fetch a single user details
    const searchPofile = ({ id }) => {
        axios.get(`http://localhost:5000/api/user/${id}`, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
            localStorage.setItem("profile", JSON.stringify(res.data));
            return navigate('/profile');
        });
    }
    //request the server to submit a reply
    const messageSubmit = () => {
        axios.post(`http://localhost:5000/api/tweet/${replytweet}/reply`, { content }, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
            setmsg(res.data);
            toast(res.data);
        }).catch(err => {
            if (err.response.status === 400) {
                toast(err.response.data);
                setmsg(err.response.data);
            }
        });
    }
    //request the server to delete a tweet
    const deleteHandler = ({ id }) => {
        axios.delete(`http://localhost:5000/api/tweet/${id}`, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
            setmsg(res.data);
            toast(res.data);
        })
    }
    const messageHandler = ({ id }) => {
        setismsg(prev => !prev);
        setreplytweet(id);
    }
    //request the server to update the like status of this post
    const likeHandler = ({ id, islike }) => {
        if (islike) {
            axios.put(`http://localhost:5000/api/tweet/${id}/dislike`, "payload", { headers: { 'x-token': localStorage.getItem('token') } }).then(res => setmsg(res.data)).catch(err => setmsg(err.response.data));
            toast("you disliked this tweet");
        }
        else {
            axios.put(`http://localhost:5000/api/tweet/${id}/like`, "payload", { headers: { 'x-token': localStorage.getItem('token') } }).then(res => setmsg(res.data)).catch(err => setmsg(err.response.data));
            toast("you liked this tweet");
        }
    }
    //request the server to retweet it
    const retweetHandler = ({ id }) => {
        axios.post(`http://localhost:5000/api/tweet/${id}/retweet`, "payload", { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
            setmsg(res.data);
            toast(res.data);
        }).catch(err => {
            if (err.response.status === 405) {
                toast("you alredy retweeted it");
                setmsg(err.response.data);
            }
        });
    }
    //request the server to update the follow status of the user
    const followHandler = () => {
        if (isfollow) {
            axios.put(`http://localhost:5000/api/user/${data._id}/unfollow`, "payload", { headers: { 'x-token': localStorage.getItem('token') } }).then(res => { setmsg(res.data); toast("unfollowed sucessfully") }).catch(err => setmsg(err.resp.msg));
            setfollolenght(prev => prev - 1);
            setisfollow(prev => !prev);
        }
        else {
            axios.put(`http://localhost:5000/api/user/${data._id}/follow`, "payload", { headers: { 'x-token': localStorage.getItem('token') } }).then(res => { setmsg(res.data); toast('follow sucessfully') }).catch(err => setmsg(err.resp.msg));
            setfollolenght(prev => prev + 1);
            setisfollow(prev => !prev);
        }
    }
    //request the server to fetch a single tweet imformation
    const opentweet = (id) => {
        axios.get(`http://localhost:5000/api/tweet/${id}`, { headers: { 'x-token': `${localStorage.getItem('token')}` } }).then(res => {
            localStorage.setItem('tweet', JSON.stringify(res.data.others));
            return navigate('/singletweet');
        });
    }
    //request the server to set or update the profile
    const uploadProfile = (e) => {
        e.preventDefault();
        const formdata = new FormData();
        formdata.append('profilephoto', profilephoto);
        axios.post(`http://localhost:5000/api/user/${data._id}/uploadprofile`, formdata).then(res => { setmsg(res.data); toast('profile uploaded successfully'); refresh(); }).catch(err => console.log(err.response));
        function refresh() {
            axios.get(`http://localhost:5000/api/user/${data._id}`, { headers: { 'x-token': localStorage.getItem('token') } }).then(res => {
                setdata(res.data);
                localStorage.setItem("profile", JSON.stringify(res.data));
                window.location.reload(false);
                return navigate('/profile');
            });
        }
    }
    const [currentImage, setCurrentImage] = useState(0);
    const images = [
        "data:image/jpeg;base64,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",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7KQ0p692Huh4u4a9EGA8hNxsbXidKwWHzFw&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-0IlJoOev0yf_6D_PTCHmVi1lwBJKz1B4vg&usqp=CAU"
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((currentImage) => (currentImage + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);
    //request the server to get all tweets.
    useEffect(() => {
        axios.get(`http://localhost:5000/api/tweet/all/${data._id}/${localStorage.getItem('userid')}`).then(res => {
            setalltweets(res.data); console.log(res.data);
        }).catch(err => console.log(err.response));
    }, [msg]);
    if (!localStorage.getItem('token')) {
        return navigate('/login');
    }
    return (
        <div className='notginh'>
            {localStorage.getItem('token') ? <div className="wap">
                {/* avail a dialog to edit the user information */}
                {isedit ? <div className="ided">
                    <div className="edwrap">
                        <h2 className='idedhead'>Edit profile</h2>
                        <div onClick={() => setisedit(prev => !prev)} className="canlog"><i class="fa-sharp fa-solid fa-xmark"></i></div>
                        <form className='edformpro' onSubmit={editsubmithandleer}>
                            <input className='proitemed' onChange={editHandler} type="text" value={eddetails.name} name='name' placeholder='Name' autoComplete='off' />
                            <input className='proitemed' onChange={editHandler} type="text" value={eddetails.location} name='location' placeholder='Location' autoComplete='off' />
                            <input className='proitemed' onChange={editHandler} type="date" name="dob" id="eddate" />
                            <input className='probtned' type="submit" value="Edit" />
                        </form>
                    </div>
                </div> : ""}
                <div className="wraper">
                    <div className="usersidebar"><Sidebar /></div>
                    <div className="prowraper">
                        <div className="style">{images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Slide ${index}`}
                                className={`slide ${index === currentImage ? "active" : ""}`}
                            />
                        ))}</div>
                        <div className="userprofile">
                            <div className="proupedwrap">
                                <div className="proimg">
                                    {/* set the profile when it has otherwise set a default profile */}
                                    {data.image === "" ? <img className='usermainpro' src='default.jpg' alt='profileimage' width={70} height={70} /> :
                                        <img className='usermainpro' src={`http://localhost:5000/images/${data.image}`} width={70} height={70} alt="profileimage" />
                                    }
                                    <div className="prousnam">
                                        {data.name}
                                    </div>
                                    <div className="detailsall prouser">@{data.username}</div>
                                </div>
                                <div className="upedwrap">
                                    {/* avail button only for the admin to change or set profile */}
                                    {data.isadmin ? <div className="photoupload">
                                        <form onSubmit={uploadProfile}>
                                            <input onChange={(e) => setprofilephoto(e.target.files[0])} type="file" name="profilphoto" id="profilephoto" required />
                                            <input className='uppobt' type="submit" value="Upload Profile Photo" />
                                        </form>
                                    </div> : ""}
                                    {data.isadmin ? <div className='editbox'><button onClick={() => setisedit(prev => !prev)} className='editbt'><Button variant="outline-primary">Edit</Button></button></div> : ""}
                                </div>
                            </div>
                            {/* extra information a user */}
                            <div className="edits">
                                <div className="loc"><span className="locdot"><i class="fa-solid fa-location-dot"></i></span> {data.location}</div>
                                <div className="dob"><span className="calendot"><i class="fa-solid fa-calendar-days"></i></span> {data.dob}</div>
                            </div>
                            <div className="folflo">
                                <div className="detailsall profollowers">{follolenght}  Followers</div>
                                <div className="detailsall profollowing"> {data.following.length === 0 ? 0 : data.following.length}  Following</div>
                            </div>
                            {data.isadmin ? "" : <div className='followdiv'><button onClick={followHandler} className='followbtn'>{data.followers.includes(localStorage.getItem('userid')) ? "follwing" : "Follow"}</button></div>}
                        </div>
                        <div className='hp'>
                            <div className="alltweets">
                                <h2 className='tweethead'>Tweets</h2>
                                {/* display all tweets by map the ourtwwets array */}
                                {alltweets?.map((tweet, index) => {
                                    return (
                                        <div key={index} className="alltweetwrapproext">
                                            <div className="ifretweeteddiv">
                                                {tweet.retweetedtweet === true && <div className='retweeturna'><img src={tweet.retweetedfrom.image === '' ? 'default.jpg' : `http://localhost:5000/images/${tweet.retweetedfrom.image}`} alt="" width={40} height={35} />@{tweet.retweetedfrom.username}</div>}
                                            </div>
                                            <div className="tweet">
                                                <div className="tweetimg">
                                                    {/* set the profile when it has otherwise set a default profile */}
                                                    {tweet.tweetedby.image === "" ? <img className='protweimg' src={`default.jpg`} alt='profile' width={40} height={35} /> :
                                                        <img className='protweimg' src={`http://localhost:5000/images/${tweet.tweetedby.image}`} alt="tweetimage" width={40} height={35} />}
                                                </div>
                                                <div className="tweetmat">
                                                    <div onClick={() => searchPofile({ id: tweet.tweetedby._id })} className='twusername'>@{tweet.tweetedby.username}</div> <span className='tweettimestamp'>   -{tweet.createdAt}</span>
                                                    <p onClick={() => opentweet(tweet._id)} className='tweetcont'>{tweet.content}</p>
                                                    {tweet.image === "" ? "" : <img src={`http://localhost:5000/tweetimages/${tweet.image}`} alt='tweetimg' width={100} height={80} />}
                                                    <div className="btns">
                                                        <ul className="btns">
                                                            <li onClick={() => likeHandler({ id: tweet._id, islike: tweet.islike })} className={tweet.islike ? "likebtn liked" : "likebtn"}>{tweet.likes.length}<i class="fa-solid fa-heart"></i></li>
                                                            <li onClick={() => messageHandler({ id: tweet._id })} className='replybtn'><i class="fa-regular fa-comment"></i></li>
                                                            {
                                                                tweet.isdeletebtn ?
                                                                    ""
                                                                    :
                                                                    <li onClick={() => retweetHandler({ id: tweet._id })} className={tweet.isretweeted ? "retweetbtn retweeted" : "retweetbtn"}>{tweet.retweetby.length}<i class="fa-solid fa-retweet"></i></li>

                                                            }
                                                            {/* avail the delete buttun for the only amdin of this tweet */}
                                                            {
                                                                tweet.isdeletebtn ?
                                                                    <li onClick={() => deleteHandler({ id: tweet._id })} className='deletebtn'><i class="fa-solid fa-trash"></i></li>
                                                                    : ""
                                                            }
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        {/* avail a dialogbox to make the comments */}
                        {ismsg ? <div className="megdia" style={{ backgroundColor: 'whitesmoke' }}>
                            <div className="comwra">
                                <div onClick={() => setismsg(prev => !prev)} className="cancel"><i class="fa-sharp fa-solid fa-xmark"></i></div>
                                <h2 className="comhead">New Comment</h2>
                                <form onSubmit={messageSubmit}>
                                    <input className='comtext' type="text" placeholder='comment' value={content} onChange={(e) => setreply(e.target.value)} />
                                    <input className='btndel' type="submit" value="Comment" />
                                </form>
                            </div>
                        </div> : ""}
                    </div>
                </div>
                <ToastContainer />
            </div> : <Navigate to='/login' />}
        </div>
    )
}
