let msg = document.querySelector(".message-body");
let sendBtn = document.querySelector(".send");
let BackBtn = document.querySelector(".back");
let chatBody = document.querySelector(".chat-body");
let chatBtn = document.querySelector(".chat-button");
let chatThread = document.querySelector(".chat-thread");
let chatBtnContainer = document.querySelector(".chat-button-container");
let textInput = document.getElementById("prompt");
let header = document.querySelector(".header");

const SNOOZE_HOURS = 7
const AUTOSHOW_DELAY_MS = 2000
const SNOOZE_KEY = "chat_snooze_until"
const SOUND_PATH = "./sounds/eureka.mp3"

const now = () => Date.now()
const hoursToMs = h => h * 60 * 60 * 1000
const getSnoozeUntil = () => Number(localStorage.getItem(SNOOZE_KEY) || 0)
const isSnoozed = () => now() < getSnoozeUntil()
const snoozeForHours = h => localStorage.setItem(SNOOZE_KEY, String(now() + hoursToMs(h)))

function hideImmediate(el) {
  try {
    el.classList.remove("visible")
    el.style.display = "none"
  } catch {}
}

// Hide instantly if snoozed (before anything else can render it)
;(function ensureHiddenWhileSnoozed() {
  if (!isSnoozed()) return
  const el = document.querySelector(".chat-thread")
  if (el) {
    hideImmediate(el)
    return
  }
  const mo = new MutationObserver(list => {
    for (const m of list) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue
        if (n.classList && n.classList.contains("chat-thread")) {
          hideImmediate(n); mo.disconnect(); return
        }
        if (n.querySelector) {
          const f = n.querySelector(".chat-thread")
          if (f) { hideImmediate(f); mo.disconnect(); return }
        }
      }
    }
  })
  mo.observe(document.documentElement, { childList: true, subtree: true })
})()

document.addEventListener("DOMContentLoaded", () => {
  const chatBtn = document.querySelector(".chat-button")
  const chatThread = document.querySelector(".chat-thread")
  if (!chatBtn || !chatThread) return

  const greetings = [
    "Hello, how can I help you?",
    "Hi there! How can I assist you today?",
    "Welcome! What can I do for you?",
    "Hello! Do you have any questions?",
    "Hi! How may I help you today?",
    "Greetings! What brings you here?",
    "Hello! What would you like to know?",
    "Hi there! Need any assistance?",
    "Welcome! How can I be of service?",
    "Hello! Do you need any help?"
  ]
  const randomGreeting = () => greetings[Math.floor(Math.random() * greetings.length)]
  const chatSound = new Audio(SOUND_PATH); chatSound.preload = "auto"

  const isVisible = () => chatThread.classList.contains("visible")
  function showThread(withGreeting = true, withSound = true) {
    if (isSnoozed() || isVisible()) return
    if (chatThread.style.display === "none") chatThread.style.display = ""
    if (withGreeting) chatThread.textContent = randomGreeting()
    chatThread.classList.add("visible")
    if (withSound) { chatSound.currentTime = 0; chatSound.play().catch(() => {}) }
  }
  function hideThread() {
    chatThread.classList.remove("visible")
  }

  let firstInteractionHandled = false
  let timer = null
  function onFirstInteraction() {
    if (firstInteractionHandled || isSnoozed() || isVisible()) return
    firstInteractionHandled = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { if (!isSnoozed() && !isVisible()) showThread(true, true) }, AUTOSHOW_DELAY_MS)
  }
  document.addEventListener("mousemove", onFirstInteraction, { once: true, passive: true })
  document.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true })

  // Important: clicking the button only snoozes and hides; it does NOT open the chat
  chatBtn.addEventListener("click", () => {
    snoozeForHours(SNOOZE_HOURS)
    hideThread()
    hideImmediate(chatThread) // ensure it won't flash again in this session
  })
})

// Track URL changes
function checkURL() {
  trackFirstInteraction();
}

// Chat sound handling
const chatSound = new Audio("./sounds/eureka.mp3");
chatSound.preload = "auto";
chatSound.load();

function playChatSound(){
  chatSound.currentTime = 0;
  chatSound.play();
}

// Track first interaction
let hasInteracted = false;

// Handle first interaction
function handleFirstInteraction() {
  if (hasInteracted) return;
  hasInteracted = true;
  
  // Mark interaction in localStorage
  if (!localStorage.getItem('firstInteraction')) {
    localStorage.setItem('firstInteraction', 'true');
    
    // Show chat thread after 2 seconds
    setTimeout(() => {
      chatThread.textContent = getRandomGreeting();
      chatThread.classList.add('visible');
      
      // Play sound after a small delay
      setTimeout(() => {
        chatSound.currentTime = 0;
        chatSound.play().catch(e => console.log('Sound play failed:', e));
      }, 100);
    }, 2000);
  }
  
  // Clean up event listeners
  document.removeEventListener('click', handleFirstInteraction);
  document.removeEventListener('keydown', handleFirstInteraction);
}

// Set up interaction listeners
document.addEventListener('click', handleFirstInteraction);
document.addEventListener('keydown', handleFirstInteraction);

// Initial setup
chatThread.style.display = 'block';

let chatMemory = [];
const MEMORY_LIMIT = 4; // keep only the last 4 messages (~2 turns)

let productList = [];
let contactList = [];
let productMap = new Map();
let contactMap = new Map();
let currencyLabel = "BDT";
let productDetailEntries = [];
let productDetailMap = new Map();
let productLookup = [];
const productLookupByName = new Map();
const productAliasMap = new Map();
let lastUserMessage = "";

const CONTACT_DETAIL_KEY_BY_ID = {
  wa: "whatsapp",
  em: "email",
  ph: "phone",
  tg: "telegram",
  msgr: "messenger_channel",
  wach: "whatsapp_channel"
};

const BLOCK_STORAGE_KEY = "ep_chat_block_state_v1";
const BLOCK_DURATIONS_MS = [
  7 * 24 * 60 * 60 * 1000,          // 1 week
  30 * 24 * 60 * 60 * 1000,         // 1 month (approx)
  182 * 24 * 60 * 60 * 1000,        // ~6 months
  365 * 24 * 60 * 60 * 1000         // 1 year
];
const BLOCK_DURATION_LABELS = ["1 week", "1 month", "6 months", "1 year"];
const BAD_WORD_PATTERNS = [
  /fuck/i,
  /shit/i,
  /bitch/i,
  /cunt/i,
  /asshole/i,
  /bastard/i,
  /dick/i,
  /slut/i,
  /whore/i
];

let blockState = loadBlockState();
let blockNoticeShown = false;
const originalPlaceholder = textInput?.placeholder || "";

function remember(role, content) {
  chatMemory.push({ role, content });
  if (chatMemory.length > MEMORY_LIMIT) {
    chatMemory = chatMemory.slice(-MEMORY_LIMIT);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Load local stock/contact JSON ---
async function showStock() {
  try {
    const res = await fetch('./data/ai/stock.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data?.items || data?.catalog || []);
    const currency = data?.cur || data?.currency || null;
    return { items, currency };
  } catch (e) {
    console.error('stock.json error:', e);
    return { items: [], currency: null };
  }
}

async function showContact() {
  try {
    const res = await fetch('./data/ai/contact.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return { items: data };
    if (Array.isArray(data?.items)) return { items: data.items };
    if (Array.isArray(data?.c)) return { items: data.c };
    return { items: [] };
  } catch (e) {
    console.error('contact.json error:', e);
    return { items: [] };
  }
}

async function showContactDetails() {
  try {
    const res = await fetch('./data/contact.json', { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return data?.contact_info || {};
  } catch (e) {
    console.error('contact details error:', e);
    return {};
  }
}

async function showStockDetails() {
  try {
    const res = await fetch('./data/stock.json', { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    return data || {};
  } catch (e) {
    console.error('stock detail error:', e);
    return {};
  }
}

function flattenStockCatalog(catalog = [], idList = []) {
  const entries = [];
  function pushEntry(detail) {
    const index = entries.length;
    const id = idList[index] || null;
    entries.push({ id, ...detail });
  }
  catalog.forEach(item => {
    if (!item) return;
    const base = {
      product: item.product || "",
      details: Array.isArray(item.details) ? item.details : [],
      delivery: item.delivery_time || "",
      notes: item.notes || null,
      categories: Array.isArray(item.categories)
        ? item.categories
        : item.category
          ? [item.category]
          : []
    };
    if (Array.isArray(item.plans)) {
      item.plans.forEach(plan => {
        if (!plan) return;
        const planName = plan.name || "";
        const planDuration = plan.duration || "";
        const planPrice = plan.price ?? null;
        if (Array.isArray(plan.tiers) && plan.tiers.length) {
          plan.tiers.forEach(tier => {
            if (!tier) return;
            pushEntry({
              product: base.product,
              plan: planName,
              duration: tier.duration || planDuration,
              price: tier.price ?? planPrice ?? null,
              details: base.details,
              delivery: base.delivery,
              notes: base.notes,
              categories: base.categories,
              meta: { ...tier, plan: planName }
            });
          });
        } else {
          pushEntry({
            product: base.product,
            plan: planName,
            duration: planDuration,
            price: planPrice,
            details: base.details,
            delivery: base.delivery,
            notes: base.notes,
            categories: base.categories,
            meta: { ...plan }
          });
        }
      });
    } else {
      pushEntry({
        product: base.product,
        plan: null,
        duration: null,
        price: null,
        details: base.details,
        delivery: base.delivery,
        notes: base.notes,
        categories: base.categories,
        meta: {}
      });
    }
  });
  return entries;
}

async function hydrateData(force = false) {
  if (!force && productList.length && contactList.length) return;

  const [
    { items: stockItems, currency },
    { items: contactItems },
    contactDetails,
    stockDetailDoc
  ] = await Promise.all([
    showStock(),
    showContact(),
    showContactDetails(),
    showStockDetails()
  ]);

  // First, load the basic product list
  productList = (Array.isArray(stockItems) ? stockItems : [])
    .map(entry => {
      if (!entry) return null;
      if (Array.isArray(entry)) {
        const [id, label, price] = entry;
        if (!id || !label) return null;
        return { id, label, price: price ?? null };
      }
      if (typeof entry === "object") {
        const id = entry.id || entry.code;
        const label = entry.label || entry.name || entry.title;
        if (!id || !label) return null;
        return { id, label, price: entry.price ?? entry.cost ?? null };
      }
      return null;
    })
    .filter(Boolean);

  const productIds = productList.map(item => item.id);

  // Then load and process the detailed catalog
  const detailedCatalog = Array.isArray(stockDetailDoc?.catalog) ? stockDetailDoc.catalog : [];
  productDetailEntries = flattenStockCatalog(detailedCatalog, productIds);
  
  // Only show mismatch warning if we have both lists and they don't match
  if (productList.length > 0 && productDetailEntries.length > 0 && 
      productList.length !== productDetailEntries.length) {
    console.warn('Stock detail mismatch:', productDetailEntries.length, productList.length);
  }

  // Merge the detailed information with the product list
  productList = productList.map((entry) => {
    // Find matching detail by ID instead of index to be more reliable
    const detail = productDetailEntries.find(d => d && d.id === entry.id) || null;
    const price = entry.price ?? detail?.price ?? null;
    const categories = Array.isArray(detail?.categories) ? detail.categories : [];
    return { ...entry, price, detail, categories };
  });

  productDetailMap = new Map(
    productList
      .map(item => {
        if (!item.detail) return null;
        return [item.id, item.detail];
      })
      .filter(Boolean)
  );

  contactList = (Array.isArray(contactItems) ? contactItems : [])
    .map(entry => {
      if (!entry) return null;
      if (Array.isArray(entry)) {
        const [id, label, rawValue, rawAction] = entry;
        if (!id || !label) return null;
        const detailKey = CONTACT_DETAIL_KEY_BY_ID[id] || id;
        const detail = contactDetails[detailKey] || {};
        const value = rawValue ?? detail.value ?? null;
        const action = rawAction ?? detail.action ?? null;
        return {
          id,
          label: label || detail.label || id,
          value,
          action
        };
      }
      if (typeof entry === "object") {
        const id = entry.id || entry.key;
        if (!id) return null;
        const detailKey = CONTACT_DETAIL_KEY_BY_ID[id] || id;
        const detail = contactDetails[detailKey] || {};
        return {
          id,
          label: entry.label || detail.label || id,
          value: entry.value ?? detail.value ?? null,
          action: entry.action ?? detail.action ?? null
        };
      }
      return null;
    })
    .filter(Boolean);

  if (currency) currencyLabel = currency;
  if (!currencyLabel && stockDetailDoc?.policy?.currency) {
    currencyLabel = stockDetailDoc.policy.currency;
  }

  productMap = new Map(productList.map(item => [item.id, item]));
  contactMap = new Map(contactList.map(item => [item.id, item]));
}

async function init() {
  await hydrateData(true);
  clearExpiredBlock();
  applyBlockState({ silent: true });
}
init().catch(err => console.error("Init Error:", err));

// --- Single, consistent splitter for text + optional JSON payload ---
function extractJsonBlock(text) {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (!m) return { message: text.trim(), payload: null };
  let payload = null;
  try { payload = JSON.parse(m[1]); } catch (_) {}
  const visible = text.slice(0, m.index).replace(/[`"\s]+$/g, "").trim();
  return { message: visible, payload };
}

// --- Chat API call to our backend ---
async function Chat(prompt, memory = []) {
  try {
    await hydrateData();
    
    // Prepare catalog data
    const catalog = productList.map(item => ({
      id: item.id,
      label: item.label,
      price: item.price ?? null,
      categories: Array.isArray(item.categories) ? item.categories : []
    }));

    // Prepare contacts data
    const contacts = contactList.map(item => ({
      id: item.id,
      label: item.label,
      value: item.value ?? null,
      action: item.action ?? null
    }));

    // Call our API endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        memory,
        products: catalog,
        contacts
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response from API');
    }

    const data = await response.json();
    console.log("Data Log: ", data);
    return data;

    
  } catch (err) {
    console.error('Chat API Error:', err);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return `${currencyLabel} ${value}`;
  return `${currencyLabel} ${amount.toLocaleString()}`;
}

function buildContactHref(contact) {
  if (!contact || !contact.value) return null;
  const action = (contact.action || "").toLowerCase();
  const raw = contact.value.trim();
  if (!raw) return null;
  if (action === "call") {
    return raw.startsWith("tel:") ? raw : `tel:${raw}`;
  }
  if (action === "mail" || action === "email") {
    return raw.startsWith("mailto:") ? raw : `mailto:${raw}`;
  }
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  return raw;
}

function triggerContactAction(id) {
  const contact = contactMap.get(id);
  if (!contact) return;
  const href = buildContactHref(contact);
  if (!href) return;
  window.location.href = href;
}

function loadBlockState() {
  const safeDefault = { warningIssued: false, level: 0, blockedUntil: null };
  if (typeof localStorage === "undefined") return { ...safeDefault };
  try {
    const raw = localStorage.getItem(BLOCK_STORAGE_KEY);
    if (!raw) return { ...safeDefault };
    const parsed = JSON.parse(raw);
    return {
      ...safeDefault,
      ...parsed
    };
  } catch (err) {
    console.warn("Block state parse error:", err);
    return { ...safeDefault };
  }
}

function saveBlockState() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(BLOCK_STORAGE_KEY, JSON.stringify(blockState));
  } catch (err) {
    console.warn("Block state save error:", err);
  }
}

function isUserBlocked() {
  return Boolean(
    blockState?.blockedUntil &&
    Date.now() < Number(blockState.blockedUntil)
  );
}

function clearExpiredBlock() {
  if (!blockState?.blockedUntil) return;
  if (Date.now() >= Number(blockState.blockedUntil)) {
    blockState.blockedUntil = null;
    blockNoticeShown = false;
    saveBlockState();
  }
}

function formatBlockUntil() {
  if (!blockState?.blockedUntil) return "further notice";
  try {
    return new Date(Number(blockState.blockedUntil)).toLocaleString();
  } catch (_) {
    return "further notice";
  }
}

function applyBlockState({ silent = false } = {}) {
  const blocked = isUserBlocked();
  if (textInput) {
    textInput.disabled = blocked;
    textInput.placeholder = blocked
      ? `You are blocked until ${formatBlockUntil()}`
      : originalPlaceholder;
  }
  if (sendBtn) {
    sendBtn.disabled = blocked;
    sendBtn.classList.toggle("blocked", blocked);
  }
  if (blocked && !silent) {
    showBlockNotice();
  }
  if (!blocked) {
    blockNoticeShown = false;
  }
}

function showSystemMessage(text) {
  if (!msg) return;
  const reply = aiMessageUI(msg);
  reply[0].classList.remove('waiting');
  reply[1].classList.remove('temp');
  reply[0].classList.add('text-message', 'show');
  reply[0].textContent = text;
  ReceiveSound();
  scrollView(msg);
}

function showBlockNotice() {
  if (blockNoticeShown) return;
  blockNoticeShown = true;
  showSystemMessage(`You have been blocked from using the assistant until ${formatBlockUntil()}.`);
}

function isAbusiveContent(text = "") {
  return BAD_WORD_PATTERNS.some((pattern) => pattern.test(text));
}

function handleAbusiveContent() {
  if (!blockState.warningIssued) {
    blockState.warningIssued = true;
    saveBlockState();
    showSystemMessage("Please keep the conversation respectful. Continued abuse will result in a block.");
    return;
  }

  const now = Date.now();
  const levelIndex = Math.min(blockState.level || 0, BLOCK_DURATIONS_MS.length - 1);
  const duration = BLOCK_DURATIONS_MS[levelIndex];
  blockState.blockedUntil = now + duration;
  blockState.level = Math.min(levelIndex + 1, BLOCK_DURATIONS_MS.length - 1);
  saveBlockState();
  blockNoticeShown = false;
  applyBlockState({ silent: true });
  showSystemMessage(`You have been blocked for ${BLOCK_DURATION_LABELS[levelIndex]} due to repeated abusive language.`);
}

function createAttachmentContainer(type) {
  const container = document.createElement("section");
  container.className = `chat-attachment chat-attachment--${type}`;
  msg.appendChild(container);
  scrollView(msg);
  return container;
}

function renderProductCards(ids = []) {
  const unique = [...new Set(ids)].filter(id => productMap.has(id)).slice(0, 6);
  if (!unique.length) return;

  const attachment = createAttachmentContainer("products");
  const slider = document.createElement("section");
  slider.className = "chat-embla embla";
  const viewport = document.createElement("div");
  viewport.className = "chat-embla__viewport embla__viewport";
  const track = document.createElement("div");
  track.className = "chat-embla__container embla__container";

  viewport.appendChild(track);
  slider.appendChild(viewport);
  attachment.appendChild(slider);

  const cards = [];

  unique.forEach((id, index) => {
    const product = productMap.get(id);
    if (!product) return;
    const detail = productDetailMap.get(id) || product.detail || null;

    const card = document.createElement("section");
    card.className = "chat-card embla__slide up";

    const title = document.createElement("h4");
    title.className = "chat-card__title";
    title.textContent = detail?.product || product.label;
    card.appendChild(title);

    const subtitleParts = [];
    if (detail?.plan) subtitleParts.push(detail.plan);
    if (detail?.duration) subtitleParts.push(detail.duration);
    const subtitleText = subtitleParts.filter(Boolean).join(" • ");

    if (subtitleText || (product.label && !title.textContent.includes(product.label))) {
      const subtitle = document.createElement("p");
      subtitle.className = "chat-card__subtitle";
      subtitle.textContent = subtitleText || product.label;
      card.appendChild(subtitle);
    }

    const priceText = formatPrice(detail?.price ?? product.price);
    if (priceText) {
      const price = document.createElement("span");
      price.className = "chat-card__price";
      price.textContent = priceText;
      card.appendChild(price);
    }

    if (detail?.delivery) {
      const delivery = document.createElement("span");
      delivery.className = "chat-card__meta";
      delivery.textContent = `Delivery: ${detail.delivery}`;
      card.appendChild(delivery);
    }

    const bulletPoints = [];
    if (Array.isArray(detail?.details)) {
      bulletPoints.push(...detail.details);
    }

    const meta = detail?.meta && typeof detail.meta === "object" ? detail.meta : null;
    if (meta) {
      Object.entries(meta).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || typeof value === "object") return;
        if (["price", "duration", "plan", "name"].includes(key)) return;
        const label = key.replace(/_/g, " ").replace(/\b\w/g, ch => ch.toUpperCase());
        bulletPoints.push(`${label}: ${value}`);
      });
    }

    if (detail?.notes) {
      bulletPoints.push(detail.notes);
    }

    const categories = Array.isArray(product.categories) && product.categories.length
      ? product.categories
      : Array.isArray(detail?.categories) && detail.categories.length
        ? detail.categories
        : [];

    if (categories.length) {
      const tags = document.createElement("div");
      tags.className = "chat-card__tags";
      categories.slice(0, 4).forEach(tag => {
        const pill = document.createElement("span");
        pill.className = "chat-card__tag";
        pill.textContent = tag;
        tags.appendChild(pill);
      });
      card.appendChild(tags);
    }

    if (bulletPoints.length) {
      const list = document.createElement("ul");
      list.className = "chat-card__list";
      bulletPoints.slice(0, 4).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    const cta = document.createElement("a");
    const askBtn = document.createElement("button");
    askBtn.className = "chat-card__cta";
    askBtn.textContent = "Buy Now";
    cta.appendChild(askBtn);
    
    // Create WhatsApp message with product details
    const productTitle = detail?.product || product.label || 'Product';
    const planName = detail?.plan || '';
    const duration = detail?.duration || '';
    const price = formatPrice(detail?.price ?? product.price) || '';
    
    let message = `*${productTitle}*`;
    if (planName) message += `%0APlan: ${planName}`;
    if (duration) message += `%0ADuration: ${duration}`;
    if (price) message += `%0APrice: ${price}`;
    message += '%0A%0AI would like to know more about this product.';
    
    // Set href for WhatsApp
    cta.href = `https://wa.me/8801570210107?text=${message}`;
    
    // Open in new tab on desktop, same tab on mobile
    cta.target = window.innerWidth > 768 ? '_blank' : '_self';
    
    // Add click handler to open in appropriate window
    cta.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        window.location.href = cta.href;
      }
      // For desktop, default anchor behavior (new tab) will work
    });
    
    card.appendChild(cta);

    track.appendChild(card);
    cards.push(card);
  });

  cards.forEach((card, index) => {
    setTimeout(() => card.classList.remove("up"), 120 * index + 100);
  });

  if (typeof EmblaCarousel === "function") {
    try {
      EmblaCarousel(viewport, {
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
        inViewThreshold: 0.7,
        slidesToScroll: 1,
        loop: false
      });
    } catch (err) {
      console.warn("Embla init failed:", err);
      viewport.classList.add("chat-embla__viewport--fallback");
    }
  } else {
    viewport.classList.add("chat-embla__viewport--fallback");
  }

  scrollView(msg);
}

function renderContactButtons(ids = [], highlight = false) {
  const unique = [...new Set(ids)].filter(id => contactMap.has(id));
  if (!unique.length && highlight) return;

  const attachment = createAttachmentContainer("contacts");
  const container = document.createElement("section");
  container.className = "chat-contacts";
  attachment.appendChild(container);

  const listSource = unique.length ? unique : Array.from(contactMap.keys());
  const list = listSource.slice(0, 6);

  const nodes = [];

  list.forEach((id, index) => {
    const contact = contactMap.get(id);
    if (!contact) return;

    const href = buildContactHref(contact);
    const isLink = Boolean(href);
    const node = document.createElement(isLink ? "a" : "button");
    node.className = "chat-contact up";
    node.dataset.id = id;

    const labelSpan = document.createElement("span");
    labelSpan.className = "chat-contact__label";
    labelSpan.textContent = contact.label;
    node.appendChild(labelSpan);

    if (contact.value) {
      const valueSpan = document.createElement("span");
      valueSpan.className = "chat-contact__value";
      valueSpan.textContent = contact.value;
      node.appendChild(valueSpan);
      node.title = contact.value;
    }

    if (isLink) {
      node.setAttribute("href", href);
      node.setAttribute("target", "_self");
    } else {
      node.type = "button";
      node.addEventListener("click", () => textInput?.focus());
    }

    container.appendChild(node);
    nodes.push(node);
  });

  if (!nodes.length) {
    attachment.remove();
    return;
  }

  nodes.forEach((node, index) => {
    setTimeout(() => node.classList.remove("up"), 120 * index + 100);
  });

  scrollView(msg);
}

function handlePayload(payload) {
  if (!payload) return;
  if (payload.action === "none") return;
  const ids = Array.isArray(payload.ids) ? payload.ids : [];
  switch (payload.action) {
    case "show_products":
      renderProductCards(ids);
      break;
    case "show_contacts":
      renderContactButtons(ids);
      break;
    case "click":
      {
        let targetIds = ids.length ? ids.slice(0, 1) : [];
        if (!targetIds.length) {
          const fallback = contactList.find(contact => (contact.action || "").toLowerCase() === "call");
          if (fallback) targetIds = [fallback.id];
        }
        renderContactButtons(targetIds, true);
        if (targetIds.length) {
          triggerContactAction(targetIds[0]);
        }
      }
      break;
    default:
      if (ids.length) renderProductCards(ids);
  }
}

// --- Main send handler wired to UI ---
async function handleSend(text) {
  if (!text || text.length < 2) return;

  clearExpiredBlock();
  applyBlockState({ silent: true });

  if (isUserBlocked()) {
    showBlockNotice();
    applyBlockState();
    return;
  }

  if (isAbusiveContent(text)) {
    handleAbusiveContent();
    return;
  }

  // UI: show user's message
  senderMessageUI(msg, text);
  await delay(900);

  const reply = aiMessageUI(msg);

  try {
    // Call our API endpoint
    const response = await Chat(text, chatMemory);
    const rawMessage = typeof response?.message === "string" ? response.message : "";
    const { message: parsedMessage, payload: inlinePayload } = extractJsonBlock(rawMessage);
    const visibleText = (parsedMessage || rawMessage || "...").trim() || "...";
    const payload = response?.payload ?? inlinePayload ?? null;

    console.log("Assistant response:", { message: visibleText, payload });

    // Show the response text
    reply[0].textContent = '';
    reply[0].textContent = visibleText;
    ReceiveSound();
    reply[0].classList.remove('waiting');
    reply[1].classList.remove('temp');
    reply[0].classList.add('text-message', 'show');
    scrollView(msg);

    // Handle any payload from the response
    if (payload && typeof payload === "object") {
      try {
        handlePayload(payload);
      } catch (e) {
        console.warn("Payload handling error:", e);
      }
    }
    
    remember('user', text);
    remember('assistant', visibleText);

    // Return the raw response for memory
    return response;
  } catch (err) {
    console.error('Error in handleSend:', err);
    reply[0].textContent = 'Sorry, there was an error processing your request.';
    return null;
  }
}

// --- Input events ---
textInput.addEventListener("keyup", async function(e) {
  const text = e.target.value;
  if (text.length < 2) {
    sendBtn.classList.remove("active");
  } else {
    sendBtn.classList.add("active");
  }

  if (e.key === "Enter" || e.keyCode === 13) {
    e.preventDefault();
    const toSend = text.trim();
    textInput.value = '';
    await handleSend(toSend);
  }
});

sendBtn.addEventListener('click', async function() {
  const text = textInput.value.trim();
  if (text.length > 1) {
    textInput.value = '';
    await handleSend(text);
  }
});


function MessageUI(text = '', type = false){
    let stricture = `
        ${type ? 'Sender' : "Resider"}, ${text}</br>
    `;
    return stricture;
}

// Function to open the chat menu
function openChatMenu() {
    clearExpiredBlock();
    applyBlockState({ silent: true });
    if (isUserBlocked()) {
        showBlockNotice();
        applyBlockState();
        return false;
    }
    BackBtn.classList.remove('close');
    chatBody.classList.remove('close');
    header.classList.remove('close')
    chatBtnContainer.classList.add('close')
    return true;
}

// Function to handle URL hash changes and auto-messages
async function CheckURL() {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('ai=')) return;
    
    const message = decodeURIComponent(hash.replace(/^ai=/, '').trim());
    if (!message) return;
    
    // Open chat menu if not already open
    const wasClosed = chatBody.classList.contains('close');
    if (wasClosed) {
        if (!openChatMenu()) return; // Don't proceed if blocked
        // Small delay to allow chat to open
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Set the input value and trigger the send
    textInput.value = message;
    sendBtn.classList.add('active');
    await handleSend(message);
    
    // Clear the hash without adding to history
    history.replaceState(null, '', ' ');
}

// Initial check on page load
CheckURL();

// Listen for URL changes
window.addEventListener('popstate', CheckURL);

// Chat button click handlers
BackBtn.addEventListener('click', function(){
    BackBtn.classList.add('close');
    chatBody.classList.add('close');
    chatBtnContainer.classList.remove('close');
    header.classList.add('close')
});

chatBtn.addEventListener('click', openChatMenu);

// Sound for outgoing messages
const outgoing = new Audio("./sounds/outgoing.mp3");
outgoing.preload = "auto";
outgoing.load();

function SendSound(){
    outgoing.currentTime = 0;
    outgoing.play()
}

// Sound for incoming messages
const incoming = new Audio("./sounds/incoming.mp3");
incoming.preload = "auto";
incoming.load();

function ReceiveSound(){
    incoming.currentTime = 0;
    incoming.play()
}


function senderMessageUI(append = document, text = '') {
  const section = document.createElement("section");
  section.className = "message Flex";

  const icon = document.createElement("section");
  icon.className = "icon";
  icon.innerHTML = `<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.0415 9.00098C2.8679 9.00098 1.9165 9.95234 1.9165 11.126C1.9165 12.2995 2.8679 13.251 4.0415 13.251C5.21511 13.251 6.1665 12.2995 6.1665 11.126C6.1665 9.95234 5.21511 9.00098 4.0415 9.00098Z" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.125 9.00098C9.95136 9.00098 9 9.95234 9 11.126C9 12.2995 9.95136 13.251 11.125 13.251C12.2986 13.251 13.25 12.2995 13.25 11.126C13.25 9.95234 12.2986 9.00098 11.125 9.00098Z" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8.99984 10.4177H6.1665" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.6667 7.58415C12.9266 6.71467 10.3978 6.16748 7.58333 6.16748C4.76883 6.16748 2.24008 6.71467 0.5 7.58415" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12.5417 6.52183L11.7926 1.71396C11.6398 0.733446 10.5748 0.202147 9.71492 0.677488L9.2793 0.918293C8.22218 1.50265 6.94449 1.50265 5.8874 0.918293L5.45177 0.677488C4.59187 0.202147 3.52684 0.733453 3.37407 1.71396L2.625 6.52183" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;

  const textNode = document.createElement("section");
  textNode.className = "text-message";
  textNode.textContent = text;

  section.append(icon, textNode);
  append.appendChild(section);

  setTimeout(function(){
      textNode.classList.add('show')
      scrollView(msg)
    SendSound()
  }, 100)
}

function aiMessageUI(append = document, text = '') {
  const section = document.createElement("section");
  section.className = "message temp Flex";

  const icon = document.createElement("section");
  icon.className = "icon";
  icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.07545 4.20909C6.31686 3.59697 7.18314 3.59697 7.42456 4.20909L8.10774 5.94121C8.54994 7.06249 9.43749 7.95008 10.5588 8.39228L12.2909 9.07546C12.903 9.31689 12.903 10.1831 12.2909 10.4246L10.5588 11.1077C9.43749 11.5499 8.54994 12.4375 8.10774 13.5588L7.42456 15.2909C7.18314 15.903 6.31686 15.903 6.07545 15.2909L5.39231 13.5588C4.95008 12.4375 4.06249 11.5499 2.94121 11.1077L1.20909 10.4246C0.596972 10.1831 0.596972 9.31689 1.20909 9.07546L2.94121 8.39228C4.06249 7.95008 4.95008 7.06249 5.39231 5.94121L6.07545 4.20909Z" stroke="#ADADAD" stroke-width="1"/>
                    <path d="M12.9689 0.941281C13.0695 0.68624 13.4305 0.68624 13.5311 0.941281L13.8157 1.663C14 2.1302 14.3698 2.50003 14.837 2.68429L15.5587 2.96893C15.8137 3.06952 15.8137 3.43047 15.5587 3.53107L14.837 3.81571C14.3698 3.99997 14 4.3698 13.8157 4.837L13.5311 5.55872C13.4305 5.81376 13.0695 5.81376 12.9689 5.55872L12.6843 4.837C12.5 4.3698 12.1302 3.99997 11.663 3.81571L10.9412 3.53107C10.6863 3.43047 10.6863 3.06952 10.9412 2.96893L11.663 2.68429C12.1302 2.50003 12.5 2.1302 12.6843 1.663L12.9689 0.941281Z" stroke="#ADADAD" stroke-width="1"/>
                    </svg>`;

  const textNode = document.createElement("section");
  textNode.className = "waiting";
  textNode.textContent = 'Thinking..';

  section.append(icon, textNode);
  append.appendChild(section);

  return [textNode, section];
}

function scrollView(container) {
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  });
}
