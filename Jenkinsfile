pipeline {
    agent any

    environment {
        DOCKER_ID = "srishti3718"
        IMAGE_NAME = "leave-management-system"
        // Update this path if your .kube\config is located elsewhere
        KUBECONFIG = 'C:\\Users\\srish\\.kube\\config'
    }

    stages {
        stage('Source') {
            steps {
                // Pulls the latest code from GitHub
                checkout scm
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

        stage('Kubernetes Deploy') {
            steps {
                echo 'Deploying to Minikube...'
                
                // 1. Ensure Persistent Storage (PVC) is created/active
                bat 'kubectl apply -f infrastructure/k8s/pvc.yaml'

                // 2. CREATE or UPDATE the Deployment/Service manifests first
                // This prevents the "NotFound" error by ensuring the resource exists
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml --validate=false'

                // 3. NOW update the image to the specific build ID for this run
                bat "kubectl set image deployment/leave-app-deployment flask-backend=${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}"
                
                // 4. Verify that the pod is healthy and running
                bat 'kubectl rollout status deployment/leave-app-deployment'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: The Leave Management System is live with data persistence!'
        }
        failure {
            echo 'FAILURE: Pipeline failed. Check the logs above to identify the issue.'
        }
    }
}