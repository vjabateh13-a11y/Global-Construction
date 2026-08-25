/**
 * GLOBAL CONSTRUCTION SERVICES LIBERIA
 * Production website interactions and EmailJS form delivery.
 *
 * EMAILJS SETUP
 * 1. Replace YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_QUOTE_TEMPLATE_ID and
 *    YOUR_CONTACT_TEMPLATE_ID below with the values from your EmailJS account.
 * 2. Configure the destination email address inside the EmailJS dashboard and
 *    inside the relevant EmailJS templates. The destination address is not a
 *    private key and does not need to be placed in this frontend file.
 * 3. Only an EmailJS PUBLIC key belongs in browser JavaScript. Never add an
 *    EmailJS private key, email password or other secret to this file.
 */

"use strict";

const EMAILJS_PUBLIC_KEY = "1DajYrxS-toAUmnNf";
const EMAILJS_SERVICE_ID = "service_p4dypdp";
const EMAILJS_QUOTE_TEMPLATE_ID = "template_1hhg4vf";
const EMAILJS_CONTACT_TEMPLATE_ID = "template_zgwnsaf";

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const DESKTOP_BREAKPOINT = 1100;
    const HEADER_SCROLL_POINT = 50;
    const BACK_TO_TOP_POINT = 520;
    const SUBMISSION_COOLDOWN_MS = 10000;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = reducedMotionQuery.matches;

    const updateMotionPreference = (event) => {
        prefersReducedMotion = event.matches;
    };

    if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", updateMotionPreference);
    } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(updateMotionPreference);
    }

    const emailJSReady = initializeEmailJS();

    initializePreloader();
    initializeMobileNavigation();
    initializeScrollControls();
    initializeSmoothNavigation();
    initializeActiveNavigation();
    initializeScrollReveals();
    initializeCounters();
    initializeProjectFilters();
    initializeFAQAccordion();
    initializeForms(emailJSReady);
    initializeNewsletterForm();
    initializeImageStates();
    initializeProjectCardAccessibility();

    /**
     * Check whether all EmailJS public configuration values were replaced.
     * @returns {boolean}
     */
    function hasEmailJSConfiguration() {
        const values = [
            EMAILJS_PUBLIC_KEY,
            EMAILJS_SERVICE_ID,
            EMAILJS_QUOTE_TEMPLATE_ID,
            EMAILJS_CONTACT_TEMPLATE_ID
        ];

        return values.every((value) => (
            typeof value === "string" &&
            value.trim().length > 0 &&
            !value.trim().startsWith("YOUR_")
        ));
    }

    /**
     * Initialize EmailJS once. The official browser SDK is loaded before this
     * script in index.html.
     * @returns {boolean}
     */
    function initializeEmailJS() {
        if (!hasEmailJSConfiguration()) {
            console.warn(
                "[EmailJS] Configuration is incomplete. Replace the four YOUR_* values at the top of script.js before publishing the forms."
            );
            return false;
        }

        if (!window.emailjs || typeof window.emailjs.init !== "function") {
            console.error(
                "[EmailJS] The EmailJS browser SDK is unavailable. Confirm that its CDN script loads before script.js."
            );
            return false;
        }

        try {
            window.emailjs.init({
                publicKey: EMAILJS_PUBLIC_KEY
            });
            return true;
        } catch (error) {
            console.error("[EmailJS] Initialization failed:", error);
            return false;
        }
    }

    /**
     * Fade away the loading screen once page assets are ready. A fallback keeps
     * a failed third-party asset from trapping visitors behind the preloader.
     */
    function initializePreloader() {
        const preloader = document.getElementById("preloader");
        let hasHidden = false;

        if (!preloader) {
            document.body.classList.add("loaded");
            return;
        }

        const hidePreloader = () => {
            if (hasHidden) {
                return;
            }

            hasHidden = true;
            document.body.classList.add("loaded");
            preloader.classList.add("is-hidden");
            preloader.setAttribute("aria-hidden", "true");

            window.setTimeout(() => {
                preloader.remove();
            }, prefersReducedMotion ? 0 : 550);
        };

        if (document.readyState === "complete") {
            window.requestAnimationFrame(hidePreloader);
        } else {
            window.addEventListener("load", hidePreloader, { once: true });
        }

        window.setTimeout(hidePreloader, 6000);
    }

    /**
     * Mobile menu behavior, including focus restoration and all required close
     * paths. CSS switches to the mobile navigation layout at 1100px.
     */
    function initializeMobileNavigation() {
        const menuButton = document.getElementById("mobileMenuBtn");
        const navigation = document.getElementById("mainNavigation");

        if (!menuButton || !navigation) {
            return;
        }

        const desktopQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT + 1}px)`);
        const navigationLinks = Array.from(navigation.querySelectorAll("a"));
        let previouslyFocusedElement = null;

        const isMenuOpen = () => menuButton.getAttribute("aria-expanded") === "true";

        const openMenu = () => {
            if (desktopQuery.matches || isMenuOpen()) {
                return;
            }

            previouslyFocusedElement = document.activeElement;
            menuButton.setAttribute("aria-expanded", "true");
            menuButton.setAttribute("aria-label", "Close navigation menu");
            menuButton.classList.add("active", "is-active");
            navigation.classList.add("active", "is-open");
            document.body.classList.add("menu-open");

            const firstLink = navigation.querySelector("a[href]");
            if (firstLink) {
                window.setTimeout(() => firstLink.focus(), prefersReducedMotion ? 0 : 180);
            }
        };

        const closeMenu = ({ restoreFocus = false } = {}) => {
            if (!isMenuOpen() && !navigation.classList.contains("is-open")) {
                return;
            }

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation menu");
            menuButton.classList.remove("active", "is-active");
            navigation.classList.remove("active", "open", "is-open");
            document.body.classList.remove("menu-open");

            if (restoreFocus) {
                const focusTarget = previouslyFocusedElement instanceof HTMLElement
                    ? previouslyFocusedElement
                    : menuButton;
                focusTarget.focus({ preventScroll: true });
            }
        };

        const toggleMenu = () => {
            if (isMenuOpen()) {
                closeMenu({ restoreFocus: true });
            } else {
                openMenu();
            }
        };

        menuButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleMenu();
        });

        navigationLinks.forEach((link) => {
            link.addEventListener("click", () => closeMenu());
        });

        document.addEventListener("click", (event) => {
            if (!isMenuOpen()) {
                return;
            }

            const target = event.target;
            if (
                target instanceof Node &&
                !navigation.contains(target) &&
                !menuButton.contains(target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && isMenuOpen()) {
                event.preventDefault();
                closeMenu({ restoreFocus: true });
            }
        });

        const resetAtDesktop = (event) => {
            if (event.matches) {
                closeMenu();
                navigation.classList.remove("active", "open", "is-open");
                menuButton.classList.remove("active", "is-active");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
                document.body.classList.remove("menu-open");
            }
        };

        if (typeof desktopQuery.addEventListener === "function") {
            desktopQuery.addEventListener("change", resetAtDesktop);
        } else if (typeof desktopQuery.addListener === "function") {
            desktopQuery.addListener(resetAtDesktop);
        }
    }

    /**
     * Apply the compact header state and back-to-top visibility using a single,
     * passive, requestAnimationFrame-throttled scroll listener.
     */
    function initializeScrollControls() {
        const header = document.getElementById("siteHeader");
        const backToTopButton = document.getElementById("backToTop");
        let ticking = false;

        const updateScrollState = () => {
            const scrollPosition = window.scrollY || document.documentElement.scrollTop;

            if (header) {
                header.classList.toggle("scrolled", scrollPosition > HEADER_SCROLL_POINT);
            }

            if (backToTopButton) {
                const shouldShow = scrollPosition > BACK_TO_TOP_POINT;
                backToTopButton.classList.toggle("is-visible", shouldShow);
                backToTopButton.classList.toggle("visible", shouldShow);
                backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
                backToTopButton.tabIndex = shouldShow ? 0 : -1;
            }

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateScrollState);
            }
        };

        window.addEventListener("scroll", requestScrollUpdate, { passive: true });
        updateScrollState();

        if (backToTopButton) {
            backToTopButton.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion ? "auto" : "smooth"
                });
            });
        }
    }

    /**
     * Smoothly navigate only to valid same-page anchors and compensate for the
     * sticky header. External links and placeholder links remain untouched.
     */
    function initializeSmoothNavigation() {
        document.addEventListener("click", (event) => {
            const source = event.target;
            if (!(source instanceof Element)) {
                return;
            }

            const anchor = source.closest("a[href^='#']");
            if (!anchor) {
                return;
            }

            const href = anchor.getAttribute("href");
            if (!href || href === "#" || href.length < 2) {
                return;
            }

            let target;
            try {
                target = document.querySelector(href);
            } catch (error) {
                console.warn(`[Navigation] Invalid anchor selector: ${href}`, error);
                return;
            }

            if (!target) {
                return;
            }

            event.preventDefault();

            const header = document.getElementById("siteHeader");
            const headerHeight = header ? header.getBoundingClientRect().height : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY;
            const scrollTop = Math.max(0, targetTop - headerHeight - 12);

            window.scrollTo({
                top: scrollTop,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });

            if (window.history && typeof window.history.pushState === "function") {
                window.history.pushState(null, "", href);
            }

            const focusDelay = prefersReducedMotion ? 0 : 500;
            window.setTimeout(() => focusSection(target), focusDelay);
        });
    }

    /**
     * Give the anchor destination programmatic focus without permanently
     * altering its normal tab order.
     * @param {Element} target
     */
    function focusSection(target) {
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const alreadyFocusable = target.matches(
            "a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );

        if (!alreadyFocusable) {
            target.setAttribute("tabindex", "-1");
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        }

        target.focus({ preventScroll: true });
    }

    /**
     * Track major navigation sections and update the active navigation link.
     */
    function initializeActiveNavigation() {
        const navigationLinks = Array.from(
            document.querySelectorAll("#mainNavigation .nav-link[href^='#']")
        );

        if (navigationLinks.length === 0) {
            return;
        }

        const linksBySection = new Map();
        navigationLinks.forEach((link) => {
            const id = link.getAttribute("href")?.slice(1);
            const section = id ? document.getElementById(id) : null;
            if (section) {
                linksBySection.set(section, link);
            }
        });

        if (linksBySection.size === 0) {
            return;
        }

        const setActiveLink = (activeLink) => {
            navigationLinks.forEach((link) => {
                const isActive = link === activeLink;
                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        };

        if (!("IntersectionObserver" in window)) {
            return;
        }

        const visibleSections = new Map();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleSections.set(entry.target, entry.intersectionRatio);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            if (visibleSections.size === 0) {
                return;
            }

            const [mostVisibleSection] = [...visibleSections.entries()]
                .sort((first, second) => second[1] - first[1])[0];
            const activeLink = linksBySection.get(mostVisibleSection);

            if (activeLink) {
                setActiveLink(activeLink);
            }
        }, {
            root: null,
            rootMargin: "-22% 0px -60% 0px",
            threshold: [0, 0.05, 0.2, 0.4, 0.65]
        });

        linksBySection.forEach((_link, section) => observer.observe(section));
    }

    /**
     * Reveal explicit animation classes and the data-animate hooks used by the
     * generated HTML. Each element is observed only until its first reveal.
     */
    function initializeScrollReveals() {
        const revealElements = Array.from(document.querySelectorAll(
            ".reveal, .reveal-left, .reveal-right, .reveal-scale, [data-animate]"
        ));

        if (revealElements.length === 0) {
            return;
        }

        const reveal = (element) => {
            element.classList.add("active", "is-visible");
        };

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            revealElements.forEach(reveal);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            root: null,
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.12
        });

        revealElements.forEach((element) => observer.observe(element));
    }

    /**
     * Animate only counters already declared in the HTML. Supports a data-target
     * value, decimal precision, prefixes, plus signs and percentage suffixes.
     */
    function initializeCounters() {
        const counters = Array.from(document.querySelectorAll("[data-counter]"));

        if (counters.length === 0) {
            return;
        }

        const animateCounter = (counter) => {
            if (counter.dataset.counterAnimated === "true") {
                return;
            }

            const originalText = counter.textContent?.trim() || "";
            const targetText = counter.dataset.target || counter.dataset.counter || originalText;
            const target = Number.parseFloat(String(targetText).replace(/[^0-9.-]/g, ""));

            if (!Number.isFinite(target)) {
                return;
            }

            counter.dataset.counterAnimated = "true";
            const prefix = counter.dataset.prefix || (originalText.startsWith("+") ? "+" : "");
            const inferredSuffix = originalText.includes("%")
                ? "%"
                : (originalText.includes("+") && !prefix ? "+" : "");
            const suffix = counter.dataset.suffix ?? inferredSuffix;
            const decimalPart = String(targetText).split(".")[1];
            const decimalPlaces = Number.parseInt(
                counter.dataset.decimals || (decimalPart ? String(decimalPart).replace(/\D/g, "").length : "0"),
                10
            );
            const duration = Number.parseInt(counter.dataset.duration || "1800", 10);

            const formatValue = (value) => {
                const rounded = decimalPlaces > 0
                    ? value.toFixed(decimalPlaces)
                    : Math.round(value).toLocaleString();
                return `${prefix}${rounded}${suffix}`;
            };

            if (prefersReducedMotion || duration <= 0) {
                counter.textContent = formatValue(target);
                return;
            }

            const startTime = performance.now();
            const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentValue = target * easeOutCubic(progress);
                counter.textContent = formatValue(currentValue);

                if (progress < 1) {
                    window.requestAnimationFrame(update);
                } else {
                    counter.textContent = formatValue(target);
                }
            };

            window.requestAnimationFrame(update);
        };

        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            counters.forEach(animateCounter);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.45
        });

        counters.forEach((counter) => observer.observe(counter));
    }

    /**
     * Filter project concepts by data-category with accessible button states and
     * lightweight Web Animations transitions.
     */
    function initializeProjectFilters() {
        const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
        const projectCards = Array.from(document.querySelectorAll("[data-category]"));

        if (filterButtons.length === 0 || projectCards.length === 0) {
            return;
        }

        const activeAnimations = new WeakMap();
        let filterVersion = 0;

        const cancelCardAnimation = (card) => {
            const animation = activeAnimations.get(card);
            if (animation) {
                animation.cancel();
                activeAnimations.delete(card);
            }
        };

        const setCardInert = (card, isInert) => {
            if ("inert" in card) {
                card.inert = isInert;
            }
        };

        const showCard = (card) => {
            cancelCardAnimation(card);
            card.classList.remove("is-hidden");
            card.removeAttribute("aria-hidden");
            setCardInert(card, false);

            if (prefersReducedMotion || typeof card.animate !== "function") {
                return;
            }

            const animation = card.animate([
                { opacity: 0, transform: "translateY(14px) scale(0.985)" },
                { opacity: 1, transform: "translateY(0) scale(1)" }
            ], {
                duration: 320,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "both"
            });

            activeAnimations.set(card, animation);
            animation.addEventListener("finish", () => {
                animation.cancel();
                activeAnimations.delete(card);
            }, { once: true });
        };

        const hideCard = (card, version) => {
            cancelCardAnimation(card);
            card.setAttribute("aria-hidden", "true");
            setCardInert(card, true);

            const finishHiding = () => {
                if (version !== filterVersion) {
                    return;
                }
                card.classList.add("is-hidden");
            };

            if (prefersReducedMotion || typeof card.animate !== "function") {
                finishHiding();
                return;
            }

            const animation = card.animate([
                { opacity: 1, transform: "scale(1)" },
                { opacity: 0, transform: "scale(0.975)" }
            ], {
                duration: 190,
                easing: "ease",
                fill: "both"
            });

            activeAnimations.set(card, animation);
            animation.addEventListener("finish", () => {
                finishHiding();
                animation.cancel();
                activeAnimations.delete(card);
            }, { once: true });
        };

        const applyFilter = (selectedButton) => {
            const selectedFilter = selectedButton.dataset.filter || "all";
            filterVersion += 1;
            const currentVersion = filterVersion;

            filterButtons.forEach((button) => {
                const isActive = button === selectedButton;
                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            projectCards.forEach((card) => {
                const category = card.dataset.category || "";
                const shouldShow = selectedFilter === "all" || category === selectedFilter;

                if (shouldShow) {
                    showCard(card);
                } else {
                    hideCard(card, currentVersion);
                }
            });
        };

        filterButtons.forEach((button, index) => {
            button.addEventListener("click", () => applyFilter(button));

            button.addEventListener("keydown", (event) => {
                let nextIndex = null;

                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    nextIndex = (index + 1) % filterButtons.length;
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    nextIndex = (index - 1 + filterButtons.length) % filterButtons.length;
                } else if (event.key === "Home") {
                    nextIndex = 0;
                } else if (event.key === "End") {
                    nextIndex = filterButtons.length - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    filterButtons[nextIndex].focus();
                    applyFilter(filterButtons[nextIndex]);
                }
            });
        });
    }

    /**
     * Create an accessible, single-open FAQ accordion with smooth answer height
     * transitions and synchronized icons/ARIA state.
     */
    function initializeFAQAccordion() {
        const faqItems = Array.from(document.querySelectorAll(".faq-item"));

        if (faqItems.length === 0) {
            return;
        }

        const answerAnimations = new WeakMap();

        const updateIcon = (question, isOpen) => {
            const icon = question.querySelector("i");
            if (!icon) {
                return;
            }

            icon.classList.toggle("fa-plus", !isOpen);
            icon.classList.toggle("fa-minus", isOpen);
        };

        const cancelAnswerAnimation = (answer) => {
            const animation = answerAnimations.get(answer);
            if (animation) {
                animation.cancel();
                answerAnimations.delete(answer);
            }
        };

        const setFAQState = (item, shouldOpen, animate = true) => {
            const question = item.querySelector(".faq-question");
            const answer = item.querySelector(".faq-answer");

            if (!question || !answer) {
                return;
            }

            cancelAnswerAnimation(answer);
            question.setAttribute("aria-expanded", String(shouldOpen));
            updateIcon(question, shouldOpen);

            if (shouldOpen) {
                item.classList.add("active");
                answer.hidden = false;

                if (!animate || prefersReducedMotion || typeof answer.animate !== "function") {
                    return;
                }

                const targetHeight = answer.scrollHeight;
                const animation = answer.animate([
                    { height: "0px", opacity: 0 },
                    { height: `${targetHeight}px`, opacity: 1 }
                ], {
                    duration: 300,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)"
                });

                answerAnimations.set(answer, animation);
                animation.addEventListener("finish", () => {
                    answerAnimations.delete(answer);
                }, { once: true });
            } else {
                item.classList.remove("active");

                if (answer.hidden) {
                    return;
                }

                if (!animate || prefersReducedMotion || typeof answer.animate !== "function") {
                    answer.hidden = true;
                    return;
                }

                const startHeight = answer.getBoundingClientRect().height || answer.scrollHeight;
                const animation = answer.animate([
                    { height: `${startHeight}px`, opacity: 1 },
                    { height: "0px", opacity: 0 }
                ], {
                    duration: 240,
                    easing: "ease-in"
                });

                answerAnimations.set(answer, animation);
                animation.addEventListener("finish", () => {
                    answer.hidden = true;
                    answerAnimations.delete(answer);
                }, { once: true });
            }
        };

        faqItems.forEach((item) => {
            const question = item.querySelector(".faq-question");
            const answer = item.querySelector(".faq-answer");

            if (!question || !answer) {
                return;
            }

            const initiallyOpen = item.classList.contains("active") ||
                question.getAttribute("aria-expanded") === "true";
            setFAQState(item, initiallyOpen, false);

            question.addEventListener("click", () => {
                const isCurrentlyOpen = question.getAttribute("aria-expanded") === "true";

                faqItems.forEach((otherItem) => {
                    if (otherItem !== item) {
                        setFAQState(otherItem, false);
                    }
                });

                setFAQState(item, !isCurrentlyOpen);
            });
        });
    }

    /**
     * Initialize independent EmailJS handlers for the construction quote and
     * general contact forms.
     * @param {boolean} isEmailJSReady
     */
    function initializeForms(isEmailJSReady) {
        const quoteForm = document.getElementById("quoteForm");
        const contactForm = document.getElementById("contactForm");
        const lastSuccessfulSubmissions = new WeakMap();
        const buttonStates = new WeakMap();

        applyInputLimits();

        if (quoteForm) {
            quoteForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                if (quoteForm.dataset.submitting === "true") {
                    return;
                }

                const status = document.getElementById("quoteStatus");
                const submitButton = quoteForm.querySelector("button[type='submit']");

                if (isInSubmissionCooldown(quoteForm, lastSuccessfulSubmissions)) {
                    setStatus(
                        status,
                        "Your request was already submitted. Please wait a moment before sending another one.",
                        "loading"
                    );
                    return;
                }

                clearFormErrors(quoteForm);
                const validation = validateQuoteForm(quoteForm);

                if (!validation.valid) {
                    setStatus(status, validation.message, "error");
                    validation.firstInvalidField?.focus();
                    return;
                }

                const quoteParams = buildQuoteParameters(validation.data);
                quoteForm.dataset.submitting = "true";
                setButtonLoading(submitButton, true, "Sending Request...", buttonStates);
                setStatus(status, "Sending your construction quote request...", "loading");

                try {
                    await sendEmailJSMessage(
                        isEmailJSReady,
                        EMAILJS_QUOTE_TEMPLATE_ID,
                        quoteParams
                    );

                    setStatus(
                        status,
                        "Thank you. Your project request has been submitted successfully. Our team will contact you shortly.",
                        "success"
                    );
                    lastSuccessfulSubmissions.set(quoteForm, Date.now());
                    quoteForm.reset();
                    clearFormErrors(quoteForm);
                } catch (error) {
                    console.error("[EmailJS] Quote request failed:", error);
                    setStatus(
                        status,
                        "We could not send your request. Please try again or contact our office directly.",
                        "error"
                    );
                } finally {
                    quoteForm.dataset.submitting = "false";
                    setButtonLoading(submitButton, false, "", buttonStates);
                }
            });

            addLiveErrorClearing(quoteForm);
        }

        if (contactForm) {
            contactForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                if (contactForm.dataset.submitting === "true") {
                    return;
                }

                const status = document.getElementById("contactStatus");
                const submitButton = contactForm.querySelector("button[type='submit']");

                if (isInSubmissionCooldown(contactForm, lastSuccessfulSubmissions)) {
                    setStatus(
                        status,
                        "Your message was already submitted. Please wait a moment before sending another one.",
                        "loading"
                    );
                    return;
                }

                clearFormErrors(contactForm);
                const validation = validateContactForm(contactForm);

                if (!validation.valid) {
                    setStatus(status, validation.message, "error");
                    validation.firstInvalidField?.focus();
                    return;
                }

                const contactParams = buildContactParameters(validation.data);
                contactForm.dataset.submitting = "true";
                setButtonLoading(submitButton, true, "Sending Message...", buttonStates);
                setStatus(status, "Sending your message...", "loading");

                try {
                    await sendEmailJSMessage(
                        isEmailJSReady,
                        EMAILJS_CONTACT_TEMPLATE_ID,
                        contactParams
                    );

                    setStatus(
                        status,
                        "Thank you. Your message has been sent successfully. Our team will respond as soon as possible.",
                        "success"
                    );
                    lastSuccessfulSubmissions.set(contactForm, Date.now());
                    contactForm.reset();
                    clearFormErrors(contactForm);
                } catch (error) {
                    console.error("[EmailJS] Contact message failed:", error);
                    setStatus(
                        status,
                        "We could not send your message. Please try again or contact our office directly.",
                        "error"
                    );
                } finally {
                    contactForm.dataset.submitting = "false";
                    setButtonLoading(submitButton, false, "", buttonStates);
                }
            });

            addLiveErrorClearing(contactForm);
        }
    }

    /**
     * Apply browser-side maximum lengths that match the sanitization limits.
     */
    function applyInputLimits() {
        const limits = {
            quoteName: 100,
            quoteCompany: 120,
            quoteEmail: 254,
            quotePhone: 32,
            projectLocation: 180,
            projectDescription: 5000,
            contactName: 100,
            contactEmail: 254,
            contactPhone: 32,
            contactSubject: 180,
            contactMessage: 5000,
            newsletterEmail: 254
        };

        Object.entries(limits).forEach(([id, maximum]) => {
            const field = document.getElementById(id);
            if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
                field.maxLength = maximum;
            }
        });
    }

    /**
     * Validate and sanitize the quote form.
     * @param {HTMLFormElement} form
     * @returns {{valid: boolean, message: string, firstInvalidField: HTMLElement|null, data: Object}}
     */
    function validateQuoteForm(form) {
        const fields = {
            fullName: form.elements.namedItem("from_name"),
            company: form.elements.namedItem("company"),
            email: form.elements.namedItem("reply_to"),
            phone: form.elements.namedItem("phone"),
            projectLocation: form.elements.namedItem("project_location"),
            projectType: form.elements.namedItem("project_type"),
            budget: form.elements.namedItem("budget"),
            startDate: form.elements.namedItem("start_date"),
            description: form.elements.namedItem("project_description"),
            consent: form.elements.namedItem("consent")
        };

        const preferredContact = form.querySelector("input[name='contact_method']:checked");
        const data = {
            fullName: sanitizeValue(getFieldValue(fields.fullName), 100),
            company: sanitizeValue(getFieldValue(fields.company), 120),
            email: sanitizeValue(getFieldValue(fields.email), 254).toLowerCase(),
            phone: sanitizeValue(getFieldValue(fields.phone), 32),
            projectLocation: sanitizeValue(getFieldValue(fields.projectLocation), 180),
            projectType: sanitizeValue(getFieldValue(fields.projectType), 100),
            budget: sanitizeValue(getFieldValue(fields.budget), 100),
            startDate: sanitizeValue(getFieldValue(fields.startDate), 30),
            description: sanitizeValue(getFieldValue(fields.description), 5000, false),
            preferredContact: sanitizeValue(getFieldValue(preferredContact), 30),
            consent: Boolean(fields.consent?.checked)
        };

        const checks = [
            [fields.fullName, data.fullName.length >= 2, "Please enter your full name."],
            [fields.email, isValidEmail(data.email), "Please enter a valid email address."],
            [fields.phone, isValidPhone(data.phone), "Please enter a valid phone or WhatsApp number."],
            [fields.projectLocation, data.projectLocation.length >= 2, "Please enter the project location."],
            [fields.projectType, data.projectType.length > 0, "Please select a project type."],
            [fields.description, data.description.length >= 10, "Please provide a brief project description of at least 10 characters."],
            [preferredContact, Boolean(preferredContact), "Please select a preferred contact method."],
            [fields.consent, Boolean(fields.consent?.checked), "Please provide consent so our team can contact you about the project."]
        ];

        return createValidationResult(checks, data);
    }

    /**
     * Validate and sanitize the contact form.
     * @param {HTMLFormElement} form
     * @returns {{valid: boolean, message: string, firstInvalidField: HTMLElement|null, data: Object}}
     */
    function validateContactForm(form) {
        const fields = {
            name: form.elements.namedItem("contact_name"),
            email: form.elements.namedItem("contact_email"),
            phone: form.elements.namedItem("contact_phone"),
            subject: form.elements.namedItem("contact_subject"),
            message: form.elements.namedItem("contact_message")
        };

        const data = {
            name: sanitizeValue(getFieldValue(fields.name), 100),
            email: sanitizeValue(getFieldValue(fields.email), 254).toLowerCase(),
            phone: sanitizeValue(getFieldValue(fields.phone), 32),
            subject: sanitizeValue(getFieldValue(fields.subject), 180),
            message: sanitizeValue(getFieldValue(fields.message), 5000, false)
        };

        const checks = [
            [fields.name, data.name.length >= 2, "Please enter your name."],
            [fields.email, isValidEmail(data.email), "Please enter a valid email address."],
            [fields.phone, data.phone.length === 0 || isValidPhone(data.phone), "Please enter a valid phone number or leave the phone field empty."],
            [fields.subject, data.subject.length >= 3, "Please enter a clear subject."],
            [fields.message, data.message.length >= 10, "Please enter a message of at least 10 characters."]
        ];

        return createValidationResult(checks, data);
    }

    /**
     * Convert validation checks into one consistent result and mark invalid
     * controls for assistive technology.
     * @param {Array} checks
     * @param {Object} data
     * @returns {Object}
     */
    function createValidationResult(checks, data) {
        for (const [field, isValid, message] of checks) {
            if (!isValid) {
                if (field instanceof HTMLElement) {
                    field.setAttribute("aria-invalid", "true");
                }

                return {
                    valid: false,
                    message,
                    firstInvalidField: field instanceof HTMLElement ? field : null,
                    data
                };
            }
        }

        return {
            valid: true,
            message: "",
            firstInvalidField: null,
            data
        };
    }

    /**
     * Quote template variables. Add these names directly to the EmailJS quote
     * template, including {{email_subject}}, {{customer_name}} and the remaining
     * keys below.
     * @param {Object} data
     * @returns {Object}
     */
    function buildQuoteParameters(data) {
        return {
            email_subject: `New Construction Quote Request - ${data.fullName}`,
            form_type: "Construction Quote Request",
            customer_name: data.fullName,
            company_name: data.company || "Not provided",
            customer_email: data.email,
            reply_to: data.email,
            customer_phone: data.phone,
            project_location: data.projectLocation,
            project_type: data.projectType,
            project_budget: data.budget || "Let's Discuss / Not specified",
            preferred_start_date: data.startDate || "Not specified",
            contact_method: data.preferredContact,
            project_description: data.description,
            contact_consent: data.consent ? "Yes" : "No",
            submitted_at: getLiberiaTimestamp(),
            source_page: window.location.href
        };
    }

    /**
     * Contact template variables. Suggested template subject:
     * New Website Inquiry - {{customer_name}}
     * @param {Object} data
     * @returns {Object}
     */
    function buildContactParameters(data) {
        return {
            email_subject: `New Website Inquiry - ${data.name}`,
            form_type: "Website Contact Inquiry",
            customer_name: data.name,
            customer_email: data.email,
            reply_to: data.email,
            customer_phone: data.phone || "Not provided",
            inquiry_subject: data.subject,
            customer_message: data.message,
            message: data.message,
            submitted_at: getLiberiaTimestamp(),
            source_page: window.location.href
        };
    }

    /**
     * Send one EmailJS message after checking configuration and SDK readiness.
     * @param {boolean} isReady
     * @param {string} templateId
     * @param {Object} parameters
     * @returns {Promise<unknown>}
     */
    async function sendEmailJSMessage(isReady, templateId, parameters) {
        if (!isReady || !window.emailjs || typeof window.emailjs.send !== "function") {
            throw new Error(
                "EmailJS is not configured. Replace the four YOUR_* constants and confirm that the EmailJS browser SDK loads successfully."
            );
        }

        return window.emailjs.send(
            EMAILJS_SERVICE_ID,
            templateId,
            parameters
        );
    }

    /**
     * Save and restore a submit button's trusted original label without placing
     * user input into innerHTML.
     * @param {HTMLButtonElement|null} button
     * @param {boolean} isLoading
     * @param {string} loadingText
     * @param {WeakMap} stateMap
     */
    function setButtonLoading(button, isLoading, loadingText, stateMap) {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }

        let state = stateMap.get(button);
        if (!state) {
            const labelElement = button.querySelector("span");
            const textNode = labelElement
                ? null
                : Array.from(button.childNodes).find((node) => (
                    node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()
                ));

            state = {
                labelElement,
                textNode,
                originalText: labelElement
                    ? labelElement.textContent
                    : (textNode?.nodeValue || button.textContent || "Submit"),
                originallyDisabled: button.disabled
            };
            stateMap.set(button, state);
        }

        button.disabled = isLoading || state.originallyDisabled;
        button.classList.toggle("loading", isLoading);
        button.setAttribute("aria-busy", String(isLoading));

        const newText = isLoading ? loadingText : state.originalText;
        if (state.labelElement) {
            state.labelElement.textContent = newText;
        } else if (state.textNode) {
            state.textNode.nodeValue = `${newText.trim()} `;
        }
    }

    /**
     * Set a form message using textContent only.
     * @param {HTMLElement|null} element
     * @param {string} message
     * @param {"success"|"error"|"loading"} type
     */
    function setStatus(element, message, type) {
        if (!element) {
            return;
        }

        element.textContent = message;
        element.classList.remove("success", "error", "loading");
        if (type) {
            element.classList.add(type);
        }
    }

    /**
     * Remove stale ARIA invalid markers before a new validation attempt.
     * @param {HTMLFormElement} form
     */
    function clearFormErrors(form) {
        form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
            field.removeAttribute("aria-invalid");
        });
    }

    /**
     * Clear an individual validation marker as the visitor corrects a field.
     * @param {HTMLFormElement} form
     */
    function addLiveErrorClearing(form) {
        form.addEventListener("input", (event) => {
            if (event.target instanceof HTMLElement) {
                event.target.removeAttribute("aria-invalid");
            }
        });

        form.addEventListener("change", (event) => {
            if (event.target instanceof HTMLElement) {
                event.target.removeAttribute("aria-invalid");
            }
        });
    }

    /**
     * Prevent an immediate duplicate after a confirmed successful submission.
     * @param {HTMLFormElement} form
     * @param {WeakMap} submissionMap
     * @returns {boolean}
     */
    function isInSubmissionCooldown(form, submissionMap) {
        const lastSubmitted = submissionMap.get(form) || 0;
        return Date.now() - lastSubmitted < SUBMISSION_COOLDOWN_MS;
    }

    /**
     * Read a form control safely.
     * @param {Element|RadioNodeList|null} field
     * @returns {string}
     */
    function getFieldValue(field) {
        if (!field) {
            return "";
        }

        if (typeof field.value === "string") {
            return field.value;
        }

        return "";
    }

    /**
     * Trim, remove null characters and enforce a sensible character limit.
     * Single-line values also collapse repeated whitespace.
     * @param {string} value
     * @param {number} maximumLength
     * @param {boolean} collapseWhitespace
     * @returns {string}
     */
    function sanitizeValue(value, maximumLength, collapseWhitespace = true) {
        let sanitized = String(value || "")
            .replace(/\0/g, "")
            .trim();

        if (collapseWhitespace) {
            sanitized = sanitized.replace(/\s+/g, " ");
        } else {
            sanitized = sanitized
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .replace(/[ \t]+/g, " ")
                .replace(/\n{4,}/g, "\n\n\n");
        }

        return sanitized.slice(0, maximumLength);
    }

    /**
     * Practical browser-side email validation. EmailJS and the destination mail
     * provider remain responsible for final deliverability.
     * @param {string} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        if (!email || email.length > 254 || /\s/.test(email)) {
            return false;
        }

        return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);
    }

    /**
     * Accept common Liberian and international phone formats without making the
     * validation unnecessarily restrictive. Between 7 and 15 digits are valid.
     * @param {string} phone
     * @returns {boolean}
     */
    function isValidPhone(phone) {
        if (!phone || !/^[+\d\s().-]+$/.test(phone)) {
            return false;
        }

        const digits = phone.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
    }

    /**
     * Create a readable submission timestamp in Liberia's time zone.
     * @returns {string}
     */
    function getLiberiaTimestamp() {
        try {
            return new Intl.DateTimeFormat("en-LR", {
                dateStyle: "medium",
                timeStyle: "medium",
                timeZone: "Africa/Monrovia"
            }).format(new Date());
        } catch (error) {
            console.warn("[Date] Liberia-formatted timestamp was unavailable:", error);
            return new Date().toLocaleString();
        }
    }

    /**
     * Validate the newsletter field without claiming an external subscription.
     */
    function initializeNewsletterForm() {
        const form = document.getElementById("newsletterForm");
        const emailField = document.getElementById("newsletterEmail");
        const status = document.getElementById("newsletterStatus");

        if (!form || !(emailField instanceof HTMLInputElement)) {
            return;
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = sanitizeValue(emailField.value, 254).toLowerCase();

            if (!isValidEmail(email)) {
                emailField.setAttribute("aria-invalid", "true");
                setStatus(status, "Please enter a valid email address.", "error");
                emailField.focus();
                return;
            }

            emailField.removeAttribute("aria-invalid");
            setStatus(
                status,
                "Newsletter signup is not connected yet, so your address was not stored. The mailing service can be connected later.",
                "loading"
            );
        });

        emailField.addEventListener("input", () => emailField.removeAttribute("aria-invalid"));
    }

    /**
     * Add non-blocking loaded/error states to images while preserving native
     * lazy loading already declared in the HTML.
     */
    function initializeImageStates() {
        const images = Array.from(document.querySelectorAll("img"));

        images.forEach((image) => {
            const markLoaded = () => {
                image.classList.add("is-loaded");
                image.classList.remove("is-error");
                image.setAttribute("aria-busy", "false");
            };

            const markError = () => {
                image.classList.add("is-error");
                image.classList.remove("is-loaded");
                image.setAttribute("aria-busy", "false");
            };

            if (image.complete) {
                if (image.naturalWidth > 0) {
                    markLoaded();
                } else {
                    markError();
                }
                return;
            }

            image.setAttribute("aria-busy", "true");
            image.addEventListener("load", markLoaded, { once: true });
            image.addEventListener("error", markError, { once: true });
        });
    }

    /**
     * Project cards already contain native buttons. These focus state classes
     * allow keyboard users to receive the same interaction context as pointer
     * users without changing the cards' tab order.
     */
    function initializeProjectCardAccessibility() {
        const projectCards = Array.from(document.querySelectorAll(".project-card"));

        projectCards.forEach((card) => {
            card.addEventListener("focusin", () => card.classList.add("keyboard-focus"));
            card.addEventListener("focusout", (event) => {
                const nextFocus = event.relatedTarget;
                if (!(nextFocus instanceof Node) || !card.contains(nextFocus)) {
                    card.classList.remove("keyboard-focus");
                }
            });
        });
    }
});
