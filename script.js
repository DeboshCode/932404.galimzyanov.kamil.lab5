"use strict";

const weeklyRevenue = [2500, 12000, 3000, 15000, 10000, 11000, 2000];
const lowRevenueExample = [0, 1500, 3000, 4200, 2000, 1000, 500];

function findMax(numbers) {
    if (numbers.length === 0) {
        return null;
    }

    let maximum = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > maximum) {
            maximum = numbers[i];
        }
    }

    return maximum;
}

function filterHighRevenue(numbers) {
    return numbers.filter(function (amount) {
        return amount > 10000;
    });
}

function calculateSum(numbers) {
    let sum = 0;

    for (const amount of numbers) {
        sum += amount;
    }

    return sum;
}

function analyzeRevenue(numbers) {
    const total = calculateSum(numbers);
    const highRevenue = filterHighRevenue(numbers);
    let lowCount = 0;

    for (const amount of numbers) {
        if (amount <= 3000) {
            lowCount++;
        }
    }

    return {
        total: total,
        maximum: findMax(numbers),
        average: numbers.length === 0 ? 0 : total / numbers.length,
        highRevenue: highRevenue,
        lowCount: lowCount,
        lowShare: numbers.length === 0 ? 0 : lowCount / numbers.length * 100
    };
}

function formatNumber(number) {
    return number.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

function displayRevenueReport(numbers, report, title) {
    const ids = ["revenue-example-title", "revenue-values", "revenue-total", "revenue-max", "revenue-average", "revenue-high-count", "revenue-low-count", "revenue-low-share", "revenue-high-values"];
    const elements = getRequiredElements(ids);

    if (!elements) {
        return false;
    }

    elements["revenue-example-title"].textContent = title;
    elements["revenue-values"].textContent = numbers.map(formatNumber).join("; ");
    elements["revenue-total"].textContent = formatNumber(report.total) + " ₽";
    elements["revenue-max"].textContent = report.maximum === null ? "Нет данных" : formatNumber(report.maximum) + " ₽";
    elements["revenue-average"].textContent = formatNumber(report.average) + " ₽";
    elements["revenue-high-count"].textContent = report.highRevenue.length;
    elements["revenue-low-count"].textContent = report.lowCount;
    elements["revenue-low-share"].textContent = formatNumber(report.lowShare) + "%";
    elements["revenue-high-values"].textContent = report.highRevenue.length === 0
        ? "Нет таких дней"
        : report.highRevenue.map(formatNumber).join("; ");

    return true;
}

function showRevenueReport(numbers, title) {
    const report = analyzeRevenue(numbers);

    if (!displayRevenueReport(numbers, report, title)) {
        return;
    }

    const enteredName = prompt("Как вас зовут?");
    const name = enteredName === null || enteredName.trim() === "" ? "гость" : enteredName.trim();

    alert("Здравствуйте, " + name + "!\nОбщая выручка – " + formatNumber(report.total)
        + " ₽, в " + report.highRevenue.length + " днях показатели были высокими.");

    console.log("Дневная выручка, ₽:", numbers);
    console.log("Общая выручка, ₽:", report.total);
    console.log("Максимальная дневная выручка, ₽:", report.maximum);
    console.log("Дни с выручкой свыше 10 000 ₽:", report.highRevenue);
    console.log("Средняя дневная выручка, ₽:", formatNumber(report.average));
    console.log("Количество дней с низкой выручкой:", report.lowCount);
    console.log("Доля дней с низкой выручкой:", formatNumber(report.lowShare) + "%");

    if (report.average < 5000) {
        console.log("Стоит проанализировать причины низкой выручки");
    }
}

function initializeRevenue() {
    const buttons = getRequiredElements(["regular-week", "low-week"]);

    if (!buttons || !displayRevenueReport(weeklyRevenue, analyzeRevenue(weeklyRevenue), "Обычная неделя")) {
        return;
    }

    buttons["regular-week"].addEventListener("click", function () {
        showRevenueReport(weeklyRevenue, "Обычная неделя");
    });

    buttons["low-week"].addEventListener("click", function () {
        showRevenueReport(lowRevenueExample, "Неделя с низкой выручкой");
    });
}

const storageKey = "startup-ideas-lab5";
let ideasState = createDefaultState();

function createDefaultState() {
    return {
        theme: "theme-light",
        ideasHidden: false,
        ideas: [
            { title: "Учёт без таблиц", audience: "Владельцы небольших магазинов", metric: "MAU: 1 200 пользователей" },
            { title: "Мастер рядом", audience: "Частные мастера и их клиенты", metric: "120 записей за месяц" },
            { title: "Витрина услуг", audience: "Начинающие специалисты", metric: "80 опубликованных страниц" },
            { title: "Заказ под контролем", audience: "Небольшие команды", metric: "95% заказов выполнены в срок" }
        ]
    };
}

function getRequiredElements(ids) {
    const elements = {};

    for (const id of ids) {
        const element = document.getElementById(id);

        if (!element) {
            console.error("Элемент не найден: #" + id);
            return null;
        }

        elements[id] = element;
    }

    return elements;
}

function getIdeasElements() {
    const container = document.querySelector("#ideas-list");

    if (!container) {
        console.error("Элемент не найден: #ideas-list");
        return null;
    }

    const elements = getRequiredElements([
        "idea-form", "idea-name", "idea-audience", "idea-metric",
        "delete-last-idea", "toggle-ideas", "toggle-theme", "ideas-message"
    ]);

    if (!elements || !document.body) {
        if (!document.body) {
            console.error("Элемент не найден: body");
        }

        return null;
    }

    elements.container = container;
    return elements;
}

function isValidIdea(idea) {
    if (!idea || typeof idea !== "object") {
        return false;
    }

    const limits = { title: 80, audience: 160, metric: 120 };

    for (const field of Object.keys(limits)) {
        if (typeof idea[field] !== "string" || idea[field].trim() === "" || idea[field].length > limits[field]) {
            return false;
        }
    }

    return true;
}

function loadIdeasState() {
    try {
        const savedText = localStorage.getItem(storageKey);

        if (savedText === null) {
            return createDefaultState();
        }

        const saved = JSON.parse(savedText);

        if (!saved || !Array.isArray(saved.ideas) || !saved.ideas.every(isValidIdea)
            || !["theme-light", "theme-dark"].includes(saved.theme)
            || typeof saved.ideasHidden !== "boolean") {
            console.error("Некорректные данные в localStorage");
            return createDefaultState();
        }

        return {
            ideas: saved.ideas.map(function (idea) {
                return { title: idea.title, audience: idea.audience, metric: idea.metric };
            }),
            theme: saved.theme,
            ideasHidden: saved.ideasHidden
        };
    } catch (error) {
        console.error("Не удалось восстановить состояние:", error.message);
        return createDefaultState();
    }
}

function saveIdeasState() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(ideasState));
        return true;
    } catch (error) {
        console.error("Не удалось сохранить состояние:", error.message);
        return false;
    }
}

function announceIdeasChange(message) {
    const elements = getRequiredElements(["ideas-message"]);

    if (!elements) {
        return;
    }

    const saved = saveIdeasState();
    elements["ideas-message"].textContent = saved
        ? message
        : message + " Изменения не сохранены: хранилище недоступно.";
}

function updateTheme(elements) {
    if (!elements || !document.body) {
        return;
    }

    const isDark = ideasState.theme === "theme-dark";
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(ideasState.theme);
    elements["toggle-theme"].textContent = isDark ? "Светлая тема" : "Тёмная тема";
    elements["toggle-theme"].setAttribute("aria-label", isDark ? "Включить светлую тему" : "Включить тёмную тему");
}

function updateIdeasVisibility(elements) {
    if (!elements) {
        return;
    }

    elements.container.classList.toggle("hidden", ideasState.ideasHidden);
    elements["toggle-ideas"].textContent = ideasState.ideasHidden ? "Показать идеи" : "Скрыть идеи";
    elements["toggle-ideas"].setAttribute("aria-expanded", String(!ideasState.ideasHidden));
}

function appendIdeaField(list, label, value) {
    const term = document.createElement("dt");
    term.textContent = label;

    const description = document.createElement("dd");
    description.textContent = value;

    list.appendChild(term);
    list.appendChild(description);
}

function createIdeaCard(idea) {
    const card = document.createElement("article");
    card.classList.add("idea-card");

    const heading = document.createElement("h3");
    heading.textContent = idea.title;

    const details = document.createElement("dl");
    appendIdeaField(details, "Целевая аудитория", idea.audience);
    appendIdeaField(details, "Метрика", idea.metric);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("secondary-button");
    deleteButton.textContent = "Удалить";
    deleteButton.setAttribute("aria-label", "Удалить идею «" + idea.title + "»");
    deleteButton.addEventListener("click", function () {
        deleteIdea(idea, card);
    });

    card.appendChild(heading);
    card.appendChild(details);
    card.appendChild(deleteButton);
    return card;
}

function deleteIdea(idea, card) {
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    const index = ideasState.ideas.indexOf(idea);

    if (index === -1 || !card || !elements.container.contains(card)) {
        console.error("Идея для удаления не найдена");
        return;
    }

    ideasState.ideas.splice(index, 1);
    card.remove();
    announceIdeasChange("Идея «" + idea.title + "» удалена.");
}

function addIdea(event) {
    event.preventDefault();
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    const idea = {
        title: elements["idea-name"].value.trim(),
        audience: elements["idea-audience"].value.trim(),
        metric: elements["idea-metric"].value.trim()
    };

    if (!isValidIdea(idea)) {
        elements["ideas-message"].textContent = "Заполните название, аудиторию и метрику. Поля не должны состоять из пробелов.";
        return;
    }

    ideasState.ideas.push(idea);
    elements.container.appendChild(createIdeaCard(idea));
    elements["idea-form"].reset();
    elements["idea-name"].focus();
    announceIdeasChange("Идея «" + idea.title + "» добавлена.");
}

function deleteLastIdea() {
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    const cards = elements.container.querySelectorAll(".idea-card");

    if (cards.length === 0) {
        console.log("Нет идей для удаления");
        elements["ideas-message"].textContent = "Список идей пуст.";
        return;
    }

    deleteIdea(ideasState.ideas[ideasState.ideas.length - 1], cards[cards.length - 1]);
}

function toggleTheme() {
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    ideasState.theme = ideasState.theme === "theme-light" ? "theme-dark" : "theme-light";
    updateTheme(elements);
    announceIdeasChange("Выбрана " + (ideasState.theme === "theme-dark" ? "тёмная" : "светлая") + " тема.");
}

function toggleIdeas() {
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    ideasState.ideasHidden = !ideasState.ideasHidden;
    updateIdeasVisibility(elements);
    announceIdeasChange(ideasState.ideasHidden ? "Идеи скрыты." : "Идеи показаны.");
}

function initializeIdeas() {
    const elements = getIdeasElements();

    if (!elements) {
        return;
    }

    ideasState = loadIdeasState();

    for (const card of elements.container.querySelectorAll(".idea-card")) {
        card.remove();
    }

    for (const idea of ideasState.ideas) {
        elements.container.appendChild(createIdeaCard(idea));
    }

    updateTheme(elements);
    updateIdeasVisibility(elements);

    elements["idea-form"].addEventListener("submit", addIdea);
    elements["delete-last-idea"].addEventListener("click", deleteLastIdea);
    elements["toggle-ideas"].addEventListener("click", toggleIdeas);
    elements["toggle-theme"].addEventListener("click", toggleTheme);
}

initializeIdeas();
initializeRevenue();
