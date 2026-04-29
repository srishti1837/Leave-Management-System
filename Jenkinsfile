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
                checkout scm
            }
        }

        stage('Check Python') {
            steps {
                bat 'python --version'
                bat 'where python'
            }
        }

        stage('Build & Test') {
            steps {
                bat 'gradlew.bat clean buildApp'
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    // Build using the specific Dockerfile in infrastructure
                    def appImage = docker.build(
                        "${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}",
                        "--no-cache -f infrastructure/docker/Dockerfile ."
                    )

                    docker.withRegistry('', 'dockerhub-creds') {
                        appImage.push()
                        appImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                // Update the image in the deployment to the specific build ID
                bat "kubectl set image deployment/leave-app-deployment flask-backend=${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}"
                
                // Apply K8s configurations
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml --validate=false'
                bat 'kubectl apply -f infrastructure/k8s/service.yaml --validate=false'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Frontend and Backend are deployed.'
        }
        failure {
            echo 'Pipeline failed. Check the console output for details.'
        }
    }
}