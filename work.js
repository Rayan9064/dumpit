const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// When user clicks "Sign Up" button, add the 'right-panel-active' class
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

// When user clicks "Login" button, remove the 'right-panel-active' class
signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});