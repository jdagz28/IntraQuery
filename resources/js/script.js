const signInButton = document.getElementById('login-42');

signInButton?.addEventListener('click', () => {
  window.location.href = '/auth/42';
});

fetch('/user')
  .then((response) => response.json())
  .then((user) => {
    if (user.error) {
      console.error(user.error);
      return;
    }
    document.getElementById('profile-pic').src = user.image.versions.medium;
    document.getElementById('login').textContent = user.login;
    document.getElementById('name').textContent = user.usual_full_name;
    document.getElementById('email').textContent = user.email;
  })
  .catch(err => {
    console.error('Error:', err);  
  });