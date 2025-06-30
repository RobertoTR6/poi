const USER_KEY = 'currentUser';

export function getCurrentUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
}