pipeline {
    agent any
    
    environment {
        DOCKER_ID = "srishti3718"
        IMAGE_NAME = "leave-management-system"
    }

    stages {
        stage('Source') {
            steps {
                // Pulls code from the GitHub repo you linked earlier
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                // Using 'bat' for Windows environment
                // We don't need chmod +x on Windows
                bat 'gradlew.bat buildApp'
            }
        }

        stage('Dockerize & Push') {
            steps {
                script {
                    /* Note: Since your Dockerfile is in 'infrastructure/docker/', 
                       we tell Docker to use that specific file (-f) but set 
                       the context to the root (.) so it can see the 'backend' folder.
                    */
                    def appImage = docker.build("${DOCKER_ID}/${IMAGE_NAME}:${env.BUILD_ID}", "-f infrastructure/docker/Dockerfile .")
                    
                    // Matches the 'docker-hub-creds' ID in your Jenkins Credential Provider
                    docker.withRegistry('', 'docker-hub-creds') {
                        appImage.push()
                        appImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                // Using 'bat' and pointing to your 'infrastructure/k8s' subfolder
                bat 'kubectl apply -f infrastructure/k8s/deployment.yaml'
                
                // If you created a separate service file:
                bat 'kubectl apply -f infrastructure/k8s/service.yaml'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the console output for details.'
        }
    }
}