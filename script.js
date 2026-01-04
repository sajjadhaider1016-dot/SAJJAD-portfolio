// Scroll reveal
const reveals=document.querySelectorAll('.reveal');
function revealOnScroll(){
  reveals.forEach(el=>{
    if(el.getBoundingClientRect().top < window.innerHeight - 100){
      el.classList.add('active');
      // Animate skill bars
      if(el.classList.contains('skill-card')){
        const bar=el.querySelector('.bar div');
        const width=bar.getAttribute('data-width');
        bar.style.width=width+'%';
      }
    }
  });
}
window.addEventListener('scroll',revealOnScroll);
revealOnScroll();

// Dark / Light toggle with icon only
const themeBtn = document.getElementById('themeToggle');

// Load saved theme
if(localStorage.getItem('theme')==='light'){
  document.body.classList.add('light');
  themeBtn.textContent='☀️';
}

themeBtn.onclick = () => {
  document.body.classList.toggle('light');
  if(document.body.classList.contains('light')){
    themeBtn.textContent = '☀️';
    localStorage.setItem('theme','light');
  } else {
    themeBtn.textContent = '🌙';
    localStorage.setItem('theme','dark');
  }
};

// Review form submission
document.getElementById('reviewForm').addEventListener('submit',function(e){
  e.preventDefault();
  alert('Thank you for your review! (Demo - connect backend to save)');
  this.reset();
});
