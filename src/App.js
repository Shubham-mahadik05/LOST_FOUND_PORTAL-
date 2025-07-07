import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { motion } from "framer-motion";
import { FaTag, FaListAlt, FaAlignLeft, FaImage, FaPaperPlane, FaSearchLocation } from "react-icons/fa"; // Add FaSearchLocation
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyATqudH7Hw5cpJCBrJnuhGE48RGcUsxHJw",   
  authDomain: "lost-found-portal-da2a1.firebaseapp.com",
  projectId: "lost-found-portal-da2a1",
  storageBucket: "lost-found-portal-da2a1.firebasestorage.app",
  messagingSenderId: "922749142719",
  appId: "1:922749142719:web:3e59cf445297f015d2280a",
  measurementId: "G-XDZMY1ZL30"
};  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "lost",
    image: null,
  });
  const [previewImg, setPreviewImg] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [comments, setComments] = useState({}); // { [itemId]: [{text, date, user}] }
  const [commentInputs, setCommentInputs] = useState({}); // { [itemId]: "" }
  const userMenuRef = useRef();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    fetchItems();
  }, []);

  const fetchCommentsForItems = (items) => {
    items.forEach(item => {
      const commentsRef = collection(db, "items", item.id, "comments");
      const q = query(commentsRef, orderBy("createdAt", "asc"));
      onSnapshot(q, (snapshot) => {
        setComments(prev => ({
          ...prev,
          [item.id]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }));
      });
    });
  };

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "items"));
    const fetchedItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(fetchedItems);
    fetchCommentsForItems(fetchedItems);
  };

  const handleLogin = () => {
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          const canvas = document.createElement("canvas");
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          // Use 2d context with no alpha channel for best color accuracy
          const ctx = canvas.getContext("2d", { alpha: false });
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.92); // Higher quality
          setForm({ ...form, image: compressedBase64 });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "items"), {
      ...form,
      imageUrl: form.image,
      user: user.email,
      createdAt: new Date(),
    });
    fetchItems();
    setForm({ title: "", description: "", category: "lost", image: null });
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchAccount = () => {
    setShowUserMenu(false);
    signOut(auth).then(() => {
      signInWithPopup(auth, provider);
    });
  };

  const handleCommentChange = (itemId, value) => {
    setCommentInputs({ ...commentInputs, [itemId]: value });
  };

  const handleCommentSubmit = async (itemId) => {
    const text = commentInputs[itemId]?.trim();
    if (!text) return;
    await addDoc(collection(db, "items", itemId, "comments"), {
      text,
      date: new Date().toLocaleString(),
      user: user ? user.email : "Anonymous",
      createdAt: new Date()
    });
    setCommentInputs({ ...commentInputs, [itemId]: "" });
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        background: "linear-gradient(120deg, var(--bg1, #f3f4f6), var(--bg2, #e0e7ff), var(--bg3, #f0abfc))",
        transition: "background 1s"
      }}
      id="animated-bg"
    >
      <header className="navbar gradient-navbar flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="heading flex items-center gap-2 text-2xl md:text-3xl font-extrabold">
            🎒 Lost & Found Portal
          </h1>
        </div>
        <div className="flex items-center gap-4 pr-12" style={{ alignItems: "center" }}>
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <img
                src={user.photoURL}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-400 shadow cursor-pointer"
                onClick={() => setShowUserMenu((v) => !v)}
              />
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.18, type: "spring" }}
                  className="user-dropdown absolute right-0 mt-3 z-50 flex flex-col gap-2 bg-white p-4 rounded-xl shadow-2xl min-w-[200px] border border-purple-100"
                  style={{ minWidth: 200 }}
                >
                  <div className="dropdown-arrow" />
                  <button
                    className="logout-btn-standout w-full"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                  <button
                    className="logout-btn-standout w-full"
                    onClick={handleSwitchAccount}
                  >
                    Use Different Account
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <button className="sign-btn" onClick={handleLogin}>
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main>
        {user && (
          <motion.form
            onSubmit={handleSubmit}
            className="report-form-standout shadow-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="report-form-header flex items-center gap-2 justify-center mb-6">
              <FaListAlt className="text-3xl text-white drop-shadow" />
              <span className="text-white text-2xl font-bold tracking-wide">Report Item</span>
            </div>
            <div className="input-group">
              <FaTag className="input-icon" />
              <input
                type="text"
                name="title"
                placeholder="Item Title"
                value={form.title}
                onChange={handleFormChange}
                required
                className="input-with-icon"
              />
            </div>
            <div className="input-group">
              <FaListAlt className="input-icon" />
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="input-with-icon"
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="input-group">
              <FaAlignLeft className="input-icon" />
              <textarea
                name="description"
                placeholder="Item Description"
                value={form.description}
                onChange={handleFormChange}
                required
                className="input-with-icon"
              ></textarea>
            </div>
            <div className="input-group">
              <FaImage className="input-icon" />
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFormChange}
                required
                className="input-with-icon"
              />
            </div>
            <motion.button
              type="submit"
              className="submit-btn flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05, backgroundColor: "#a78bfa" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FaPaperPlane /> Submit Item
            </motion.button>
          </motion.form>
        )}

        <section className="p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="item-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ cursor: "pointer" }}
                  onClick={() => setPreviewImg(item.imageUrl)}
                />
                <h3>{item.title}</h3>
                <p className="desc">{item.description}</p>
                <div className="meta">
                  <span className={
                    item.category === "lost" ? "category-lost" : "category-found"
                  }>
                    {item.category.toUpperCase()}
                  </span>
                  <span className="user">{item.user}</span>
                </div>
                {/* Only show delete button if current user is the uploader */}
                {user && item.user === user.email && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                )}

                {/* Comments Section */}
                <div className="comments-section mt-4">
                  {/* Show comment input section ONLY if user is NOT logged in */}
                  {!user && (
                    <div className="comment-section mt-3">
                      <div className="comments-list mb-2">
                        {(comments[item.id] || []).map((c, idx) => (
                          <div key={idx} className="comment-item">
                            <span
                              className="comment-text"
                              style={{
                                color: "#2563eb",
                                fontWeight: 700,
                                background: "#e0e7ff",
                                borderRadius: "0.4rem",
                                padding: "0.18rem 0.7rem",
                                boxShadow: "0 1px 6px 0 #a5b4fc33",
                                fontSize: "1.04rem",
                                letterSpacing: "0.01em"
                              }}
                            >
                              {c.text}
                            </span>
                            <span className="comment-date">{c.date}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 w-full">
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Add a comment..."
                          value={commentInputs[item.id] || ""}
                          onChange={e => handleCommentChange(item.id, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleCommentSubmit(item.id);
                          }}
                          style={{
                            width: "80%",
                            maxWidth: "320px",
                            minWidth: "180px"
                          }}
                        />
                        <button
                          className="comment-btn"
                          style={{
                            width: "80%",
                            maxWidth: "320px",
                            minWidth: "180px",
                            height: "2.5rem",
                            margin: "0.5rem auto 0 auto",
                            display: "block"
                          }}
                          onClick={() => handleCommentSubmit(item.id)}
                        >
                          Comment
                        </button>
                        <span
                          style={{
                            color: "#ef4444",
                            fontWeight: 700,
                            fontSize: "0.98rem",
                            marginTop: "0.6rem",
                            borderBottom: "1.5px solid #ef4444",
                            paddingBottom: "0.2rem",
                            display: "block",
                            textAlign: "center"
                          }}
                        >
                          <b>Enter the name, department and class details here</b>
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Always show the comments list for logged-in users, but do not show input or delete button */}
                  {user && (
                    <div className="comments-list mb-2">
                      {(comments[item.id] || []).map((c, idx) => (
                        <div key={idx} className="comment-item">
                          <span
                            className="comment-text"
                            style={{
                              color: "#2563eb",
                              fontWeight: 700,
                              background: "#e0e7ff",
                              borderRadius: "0.4rem",
                              padding: "0.18rem 0.7rem",
                              boxShadow: "0 1px 6px 0 #a5b4fc33",
                              fontSize: "1.04rem",
                              letterSpacing: "0.01em"
                            }}
                          >
                            {c.text}
                          </span>
                          <span className="comment-date">{c.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="modal-overlay" onClick={() => setPreviewImg(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={previewImg} alt="Preview" />
            <button className="close-modal" onClick={() => setPreviewImg(null)}>×</button>
          </div>
        </div>
      )}

      <footer className="text-center p-4 text-sm text-gray-500">
        Developed by Shubham Mahadik • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
