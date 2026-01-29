let flickerInterval;

export function stopFlicker() { 
    if (flickerInterval) clearInterval(flickerInterval); 
}

export function startFlicker(emojiSet) {
    stopFlicker();
    const el = document.getElementById('flicker-target');
    if(!el) return;
    flickerInterval = setInterval(() => { 
        el.innerText = emojiSet[Math.floor(Math.random() * emojiSet.length)]; 
    }, 400); 
}

export function transition(container, cb) {
    container.classList.add('fade-out');
    setTimeout(() => { 
        cb(); 
        container.classList.remove('fade-out'); 
        container.classList.add('fade-in'); 
    }, 400);
}
