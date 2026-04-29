pipeline {
    agent any

    environment {
        DOCKER_ID = "srishti3718"
        IMAGE_NAME = "leave-management-system"
        // Ensure this points to your specific .kube\config
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
                // Cleans old builds and runs the custom buildApp task
                bat 'gradlew.bat clean buildApp'
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    echo "Building Docker Image for Build ID: ${env.BUILD_ID}"
                    // Builds the image using the Dockerfile in your infrastructure folder
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
                
                // 1. Ensure Persistent Storage (PVC) is created first
                // This ensures your SQLite database persists across builds
                bat 'kubectl apply -f infrastructure/k8s/pvc.yaml'

                // 2. Update the Deployment to use the newly created image tag
                bat "kubectl set image deployment/leave-app-deployment flask-backend=${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}"
                
                // 3. Apply the Deployment and Service configurations
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml --validate=false'

                // 4. Verify that the rollout is progressing successfully
                bat 'kubectl rollout status deployment/leave-app-deployment'
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: The Leave Management System is updated and live!'
        }
        failure {
            echo 'FAILURE: The pipeline failed. Please check the stage logs above.'
        }
    }
}