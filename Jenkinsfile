pipeline {
    agent any

    environment {
        DOCKER_ID = "srishti3718"
        IMAGE_NAME = "leave-management-system"
        KUBECONFIG = 'C:\\Users\\srish\\.kube\\config'
    }

    stages {
        stage('Source') {
            steps {
                // Pulls the latest code from your GitHub repository
                checkout scm
            }
        }

        stage('Check & Install Dependencies') {
            steps {
                echo 'Installing Python libraries and Ansible collections...'
                // Ensures the agent has the tools needed for Ansible's K8s modules
                bat 'pip install kubernetes PyYAML'
                bat 'ansible-galaxy collection install -r infrastructure/ansible/requirements.yml --upgrade'
            }
        }

        stage('Build & Test') {
            steps {
                echo 'Building Application...'
                // Runs your Gradle build task
                bat 'gradlew.bat clean buildApp'
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    echo 'Building Docker Image...'
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
                echo 'Running Ansible Playbook to verify Infrastructure...'
                // Ansible ensures the environment (like the PVC) is ready
                bat 'ansible-playbook infrastructure/ansible/deploy.yml'
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                echo 'Deploying to Kubernetes Cluster...'
                
                // 1. Ensure the Persistent Volume Claim is applied
                bat 'kubectl apply -f infrastructure/k8s/pvc.yaml'

                // 2. Update the Deployment to use the new image created in this build
                bat "kubectl set image deployment/leave-app-deployment flask-backend=${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}"
                
                // 3. Apply the full Deployment/Service manifest
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml --validate=false'

                // 4. Wait for the pods to be ready
                bat 'kubectl rollout status deployment/leave-app-deployment'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: The Leave Management System is live with persistent storage.'
        }
        failure {
            echo 'FAILURE: Pipeline failed. Check the logs above for specific error details.'
        }
    }
}