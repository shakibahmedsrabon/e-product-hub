document.addEventListener("DOMContentLoaded", function () {
	const cats = [
		{
			name: "Bruno",
			image:
				"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Salvia",
			image:
				"https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Endra",
			image:
				"https://images.unsplash.com/photo-1519052537078-e6302a4968d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Flavio",
			image:
				"https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Excel",
			image:
				"https://images.unsplash.com/photo-1492370284958-c20b15c692d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Andrea",
			image:
				"https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Samuel",
			image:
				"https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		},
		{
			name: "Fabio",
			image:
				"https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
		}
	];

	let likedCount = 0;
	let dislikedCount = 0;
	let currentIndex = 0;
	let isAnimating = false;
	let cards = [];

	const cardContainer = document.querySelector(".card-container");
	const emptyState = document.querySelector(".empty-state");
	const counter = document.querySelector(".counter");
	const likedCountEl = document.querySelector(".liked-count");
	const dislikedCountEl = document.querySelector(".disliked-count");
	const likeBtn = document.getElementById("like-btn");
	const dislikeBtn = document.getElementById("dislike-btn");
	const pawLeft = document.querySelector(".paw-left");
	const pawRight = document.querySelector(".paw-right");

	// Initialize the app
	function init() {
		counter.classList.remove("hidden");
		updateCounter();

		// Create initial cards
		for (let i = 0; i < 3; i++) {
			if (currentIndex + i < cats.length) {
				createCard(cats[currentIndex + i], i + 1);
			}
		}

		// Set up drag events for the top card
		if (cards.length > 0) {
			setupDrag(cards[0]);
		}
	}

	// Create a card
	function createCard(catData, position) {
		const card = document.createElement("div");
		card.className = `card card-${position}`;
		card.style.backgroundImage = `url(${catData.image})`;

		const cardContent = document.createElement("div");
		cardContent.className = "card-content";

		const catText = document.createElement("p");
		catText.className = "text-xl font-semibold mb-2";
		catText.textContent = catData.name;

		const catNumber = document.createElement("p");
		catNumber.className = "text-sm opacity-80";
		catNumber.textContent = ``;

		cardContent.appendChild(catText);
		cardContent.appendChild(catNumber);
		card.appendChild(cardContent);
		cardContainer.appendChild(card);

		cards.push(card);
		currentIndex++;
	}

	// Set up drag events for a card
	function setupDrag(card) {
		let startX, startY, moveX, moveY;
		let isDragging = false;

		card.addEventListener("mousedown", startDrag);
		card.addEventListener("touchstart", startDrag, { passive: false });

		function startDrag(e) {
			if (isAnimating) return;

			isDragging = true;
			const clientX = e.clientX || e.touches[0].clientX;
			const clientY = e.clientY || e.touches[0].clientY;

			startX = clientX;
			startY = clientY;

			document.addEventListener("mousemove", drag);
			document.addEventListener("touchmove", drag, { passive: false });
			document.addEventListener("mouseup", endDrag);
			document.addEventListener("touchend", endDrag);
		}

		function drag(e) {
			if (!isDragging) return;

			e.preventDefault();

			const clientX = e.clientX || e.touches[0].clientX;
			const clientY = e.clientY || e.touches[0].clientY;

			moveX = clientX - startX;
			moveY = clientY - startY;

			// Calculate rotation based on drag distance
			const rotate = moveX * 0.1;

			// Apply transform
			card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;

			// Show paw icon if dragged far enough
			if (moveX > 50) {
				pawRight.classList.add("show-paw");
				pawLeft.classList.remove("show-paw");
			} else if (moveX < -50) {
				pawLeft.classList.add("show-paw");
				pawRight.classList.remove("show-paw");
			} else {
				pawLeft.classList.remove("show-paw");
				pawRight.classList.remove("show-paw");
			}
		}

		function endDrag() {
			if (!isDragging) return;

			isDragging = false;

			document.removeEventListener("mousemove", drag);
			document.removeEventListener("touchmove", drag);
			document.removeEventListener("mouseup", endDrag);
			document.removeEventListener("touchend", endDrag);

			pawLeft.classList.remove("show-paw");
			pawRight.classList.remove("show-paw");

			// Check if card was dragged far enough to trigger swipe
			const threshold = 100;

			if (moveX > threshold) {
				swipeRight();
			} else if (moveX < -threshold) {
				swipeLeft();
			} else {
				// Return to original position
				card.style.transition = "transform 0.5s";
				card.style.transform = "translateY(0) rotate(0deg)";

				setTimeout(() => {
					card.style.transition = "";
				}, 500);
			}
		}
	}

	// Swipe right (like)
	function swipeRight() {
		if (isAnimating || cards.length === 0) return;

		isAnimating = true;
		likedCount++;
		updateCounter();

		const card = cards[0];
		card.classList.add("swipe-right");

		setTimeout(() => {
			card.remove();
			cards.shift();

			// Create new card if available
			if (currentIndex < cats.length) {
				createCard(cats[currentIndex], 3);
			}

			// Update positions of remaining cards
			updateCardPositions();

			// Set up drag for new top card
			if (cards.length > 0) {
				setupDrag(cards[0]);
			} else {
				showEmptyState();
			}

			isAnimating = false;
		}, 300);
	}

	// Swipe left (dislike)
	function swipeLeft() {
		if (isAnimating || cards.length === 0) return;

		isAnimating = true;
		dislikedCount++;
		updateCounter();

		const card = cards[0];
		card.classList.add("swipe-left");

		setTimeout(() => {
			card.remove();
			cards.shift();

			// Create new card if available
			if (currentIndex < cats.length) {
				createCard(cats[currentIndex], 3);
			}

			// Update positions of remaining cards
			updateCardPositions();

			// Set up drag for new top card
			if (cards.length > 0) {
				setupDrag(cards[0]);
			} else {
				showEmptyState();
			}

			isAnimating = false;
		}, 300);
	}

	// Update positions of cards in stack
	function updateCardPositions() {
		cards.forEach((card, index) => {
			card.className = `card card-${index + 1}`;
		});
	}

	// Show empty state when no cards left
	function showEmptyState() {
		emptyState.classList.remove("hidden");
		counter.classList.add("hidden");
	}

	// Update counter display
	function updateCounter() {
		likedCountEl.textContent = likedCount;
		dislikedCountEl.textContent = dislikedCount;
	}

	// Button event listeners
	likeBtn.addEventListener("click", () => {
		pawRight.classList.add("show-paw");
		setTimeout(() => pawRight.classList.remove("show-paw"), 500);
		swipeRight();
	});

	dislikeBtn.addEventListener("click", () => {
		pawLeft.classList.add("show-paw");
		setTimeout(() => pawLeft.classList.remove("show-paw"), 500);
		swipeLeft();
	});

	// Keyboard event listeners
	document.addEventListener("keydown", (e) => {
		if (isAnimating) return;

		if (e.key === "ArrowRight") {
			swipeRight();
		} else if (e.key === "ArrowLeft") {
			swipeLeft();
		}
	});

	init();
});