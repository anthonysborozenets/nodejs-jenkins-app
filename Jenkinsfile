// Jenkinsfile — Groovy Declarative Pipeline
// Запускається вручну (або по тригеру).
// Кроки: pull → build image → run tests → push to Docker Hub

pipeline {

    // Запускати pipeline на Jenkins worker (агенті), а не на master
    agent { label "worker" }

    // ── Змінні середовища ──────────────────────────────────────
    environment {
        // Твій логін на Docker Hub (замін на свій!)
        DOCKERHUB_USER = "anthonysborozenets"

        // Назва образу: username/app-name
        IMAGE_NAME = "${DOCKERHUB_USER}/nodejs-jenkins-app"

        // Тег образу: номер білду Jenkins (наприклад :42)
        IMAGE_TAG = "${BUILD_NUMBER}"

        // ID credentials, які ти додав у Jenkins
        // (Manage Jenkins → Credentials → your_dockerhub_creds)
        DOCKERHUB_CREDENTIALS = "dockerhub-credentials"
    }

    stages {

        // ── Крок 1: Отримати код із GitHub ─────────────────────
        stage("Pull the code") {
            steps {
                echo "=== Отримуємо код із GitHub ==="

                // Клонуємо репозиторій. Замін URL на свій!
                git branch: "main",
                    url: "https://github.com/anthonysborozenets/nodejs-jenkins-app.git"

                echo "✅ Код успішно отримано"
            }
        }

        // ── Крок 2: Зібрати Docker-образ ───────────────────────
        stage("Build Docker image") {
            steps {
                echo "=== Збираємо Docker-образ ==="

                // docker build -t username/app:42 .
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."

                // Також тегуємо як :latest для зручності
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"

                echo "✅ Образ зібрано: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        // ── Крок 3: Запустити тести всередині образу ───────────
        stage("Run tests") {
            steps {
                echo "=== Запускаємо тести всередині Docker ==="

                // Запускаємо контейнер з командою npm test
                // --rm — автоматично видалити контейнер після завершення
                sh "docker run --rm ${IMAGE_NAME}:${IMAGE_TAG} npm test"

                echo "✅ Тести пройшли успішно"
            }
        }

        // ── Крок 4: Push образу на Docker Hub ──────────────────
        // Цей крок виконується ТІЛЬКИ якщо тести пройшли (попередній stage не впав)
        stage("Push to Docker Hub") {
            steps {
                echo "=== Відправляємо образ на Docker Hub ==="

                // withCredentials — безпечно читає логін/пароль із Jenkins Credentials.
                // usernamePassword — тип credentials (Username with password).
                // credentialsId — ID який ти задав при додаванні credentials.
                // usernameVariable / passwordVariable — імена змінних у shell.
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKERHUB_CREDENTIALS}",
                        usernameVariable: "DOCKER_USER",
                        passwordVariable: "DOCKER_PASS"
                    )
                ]) {
                    // Логінимось у Docker Hub
                    // --password-stdin — безпечніший спосіб (пароль не видно в логах)
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"

                    // Пушимо обидва теги: :42 і :latest
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"

                    echo "✅ Образ відправлено: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }

    // ── Пост-дії: виконуються після всіх stages ─────────────────
    post {

        // Якщо pipeline впав (тести провалились або інша помилка)
        failure {
            echo "❌ Tests failed"
        }

        // Якщо все пройшло успішно
        success {
            echo "🎉 Pipeline виконано успішно! Образ на Docker Hub: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        // Виконується ЗАВЖДИ (і при успіху, і при помилці)
        always {
            echo "=== Очищення: видаляємо локальні Docker-образи ==="
            // Видаляємо образ щоб не засмічувати диск worker-а
            sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest || true"

            // Розлогінюємось із Docker Hub для безпеки
            sh "docker logout || true"
        }
    }
}
