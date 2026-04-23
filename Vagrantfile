# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # ════════════════════════════════════════════════════════════
  # VM 1 — Jenkins Master (запускається в Docker)
  # IP: 192.168.56.10  |  порт Jenkins: localhost:8080
  # ════════════════════════════════════════════════════════════
  config.vm.define "jenkins-master" do |master|
    master.vm.box = "ubuntu/jammy64"          # Ubuntu 22.04 LTS
    master.vm.hostname = "jenkins-master"

    # Приватна мережа для комунікації master ↔ worker
    master.vm.network "private_network", ip: "192.168.56.10"

    # Пробрасуємо Jenkins UI на хост-машину
    master.vm.network "forwarded_port", guest: 8080, host: 8080

    master.vm.provider "virtualbox" do |vb|
      vb.name   = "jenkins-master"
      vb.memory = 2048   # Jenkins потребує мінімум 2 ГБ RAM
      vb.cpus   = 2
    end

    # ── Provisioning: встановлення Docker і запуск Jenkins ──
    master.vm.provision "shell", inline: <<-SHELL
      set -e
      echo "=== [Master] Оновлення пакетів ==="
      apt-get update -qq

      echo "=== [Master] Встановлення Docker ==="
      apt-get install -y ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg

      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null

      apt-get update -qq
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

      # Додаємо vagrant у групу docker (щоб не писати sudo)
      usermod -aG docker vagrant

      echo "=== [Master] Запуск Jenkins у Docker ==="
      # Створюємо том для збереження даних Jenkins між перезапусками
      docker volume create jenkins-data

      # Запускаємо Jenkins:
      # -d            — у фоновому режимі
      # -p 8080:8080  — UI Jenkins
      # -p 50000:50000 — порт для підключення Jenkins агентів (workers)
      # -v jenkins-data — зберігаємо конфіг Jenkins поза контейнером
      # -v /var/run/docker.sock — даємо Jenkins доступ до Docker хоста
      docker run -d \
        --name jenkins \
        --restart unless-stopped \
        -p 8080:8080 \
        -p 50000:50000 \
        -v jenkins-data:/var/jenkins_home \
        -v /var/run/docker.sock:/var/run/docker.sock \
        jenkins/jenkins:lts

      echo "=== [Master] Чекаємо поки Jenkins стартує (~60 сек) ==="
      sleep 60

      echo "=== [Master] Початковий пароль адміністратора Jenkins ==="
      docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword || true

      echo ""
      echo "✅ Jenkins Master готовий!"
      echo "   Відкрий у браузері: http://localhost:8080"
    SHELL
  end

  # ════════════════════════════════════════════════════════════
  # VM 2 — Jenkins Worker (agent, встановлений напряму на VM)
  # IP: 192.168.56.20
  # ════════════════════════════════════════════════════════════
  config.vm.define "jenkins-worker" do |worker|
    worker.vm.box = "ubuntu/jammy64"
    worker.vm.hostname = "jenkins-worker"

    worker.vm.network "private_network", ip: "192.168.56.20"

    worker.vm.provider "virtualbox" do |vb|
      vb.name   = "jenkins-worker"
      vb.memory = 2048
      vb.cpus   = 2
    end

    # ── Provisioning: Docker + Java (потрібна для Jenkins agent) ──
    worker.vm.provision "shell", inline: <<-SHELL
      set -e
      echo "=== [Worker] Оновлення пакетів ==="
      apt-get update -qq

      echo "=== [Worker] Встановлення Java (потрібна для Jenkins agent) ==="
      apt-get install -y openjdk-17-jre-headless

      echo "=== [Worker] Встановлення Docker ==="
      apt-get install -y ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg

      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null

      apt-get update -qq
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

      systemctl enable docker
      systemctl start docker

      # Додаємо vagrant у групу docker
      usermod -aG docker vagrant

      echo "=== [Worker] Створення директорії для Jenkins agent ==="
      # Jenkins master завантажить agent.jar і запустить його тут
      mkdir -p /home/vagrant/jenkins-agent
      chown vagrant:vagrant /home/vagrant/jenkins-agent

      echo ""
      echo "✅ Jenkins Worker готовий!"
      echo "   Java: $(java -version 2>&1 | head -1)"
      echo "   Docker: $(docker --version)"
      echo "   IP: 192.168.56.20"
      echo ""
      echo "📋 Наступний крок: підключи цю VM як агент у Jenkins UI"
      echo "   Manage Jenkins → Nodes → New Node"
      echo "   Remote root: /home/vagrant/jenkins-agent"
      echo "   Launch method: via SSH"
      echo "   Host: 192.168.56.20 | User: vagrant"
    SHELL
  end

end
