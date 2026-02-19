// FAQ Toggle Logic
document.querySelectorAll('.faq-question').forEach(button => {
    // ... (existing code logic remains same)
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const answer = button.nextElementSibling;
        const icon = button.querySelector('.icon');
        const isOpen = answer.classList.contains('show');
        document.querySelectorAll('.faq-answer').forEach(el => {
            el.classList.remove('show');
            el.previousElementSibling.querySelector('.icon').textContent = '+';
        });
        if (!isOpen) {
            answer.classList.add('show');
            icon.textContent = '×';
        } else {
            answer.classList.remove('show');
            icon.textContent = '+';
        }
    });
});

// Authentication UI Logic
const signBtn = document.querySelector('.nav-buttons .btn-red');
const user = JSON.parse(localStorage.getItem('netflix_user'));

if (user && signBtn) {
    signBtn.textContent = 'Sign Out';
    signBtn.addEventListener('click', () => {
        localStorage.removeItem('netflix_user');
        window.location.href = 'auth.html';
    });
} else if (signBtn) {
    signBtn.textContent = 'Sign In';
    signBtn.addEventListener('click', () => {
        window.location.href = 'auth.html';
    });
}

// TMDB Integration
const API_KEY = '3fd2be359067b40d02989a30cf571c26'; // Placeholder key from common examples, should ideally be in .env
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

const requests = {
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`,
    fetchNetflixOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213`,
    fetchTopRated: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`,
    fetchComedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`,
    fetchHorrorMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`,
};

async function getMovies(url, containerId) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        showMovies(data.results, containerId);
    } catch (err) {
        console.error('Error fetching movies:', err);
    }
}

function showMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    movies.forEach(movie => {
        const { poster_path, title, name, vote_average } = movie;
        if (!poster_path) return;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');
        movieEl.innerHTML = `
            <img src="${IMG_PATH + poster_path}" alt="${title || name}">
            <div class="movie-info">
                <h3>${title || name}</h3>
                <span class="rating">${vote_average}</span>
            </div>
        `;
        container.appendChild(movieEl);
    });
}

// Initialize movies if we are on index page
if (document.getElementById('trending-row')) {
    getMovies(requests.fetchTrending, 'trending-row');
    getMovies(requests.fetchNetflixOriginals, 'originals-row');
    getMovies(requests.fetchTopRated, 'top-rated-row');
}
