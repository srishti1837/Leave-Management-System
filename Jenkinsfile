pipeline {
    agent any

    environment {
        DOCKER_ID = "srishti3718"
        IMAGE_NAME = "leave-management-system"
        // Ensure this path points to your actual .kube\config
        KUBECONFIG = 'C:\\Users\\srish\\.kube\\config'
    }

    stages {
        stage('Source') {
            steps {
                checkout scm
            }
        }

        stage('Check & Install Dependencies') {
            steps {
                echo 'Installing Python dependencies and Ansible...'
                // 1. Install necessary Python libraries and Ansible itself
                bat 'python -m pip install --upgrade pip'
                bat 'python -m pip install kubernetes PyYAML ansible'
                
                // 2. Install the K8s collection using the Python module interface
                echo 'Installing Ansible Galaxy collections...'
                bat 'python -m ansible.cli.galaxy collection install -r infrastructure/ansible/requirements.yml --upgrade'
            }
        }

        stage('Build & Test') {
            steps {
                echo 'Building Application using Gradle...'
                bat 'gradlew.bat clean buildApp'
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    echo "Building Docker Image for Build ID: ${env.BUILD_ID}"
                    def appImage = docker.build(
                        "${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}",
                        "--no-cache -f infrastructure/docker/Dockerfile ."
                    )

                    echo 'Pushing Image to Docker Hub...'
                    docker.withRegistry('', 'dockerhub-creds') {
                        appImage.push()
                        appImage.push('latest')
                    }
                }
            }
        }

        stage('Ansible Infrastructure Prep') {
            steps {
                echo 'Running Ansible Playbook via Python module...'
                // Using the module path to ensure Ansible runs on Windows Jenkins
                bat 'python -m ansible.cli.playbook infrastructure/ansible/deploy.yml'
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                echo 'Finalizing Deployment to Kubernetes...'
                
                // 1. Ensure Persistent Storage is active
                bat 'kubectl apply -f infrastructure/k8s/pvc.yaml'

                // 2. Update the Deployment to use the newly pushed image
                bat "kubectl set image deployment/leave-app-deployment flask-backend=${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}"
                
                // 3. Apply general configurations (Deployment/Service)
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml --validate=false'

                // 4. Verification
                bat 'kubectl rollout status deployment/leave-app-deployment'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Full CI/CD cycle complete. Data is persistent and app is live.'
        }
        failure {
            echo 'FAILURE: Check the "Console Output" in Jenkins to see which stage failed.'
        }
    }
}