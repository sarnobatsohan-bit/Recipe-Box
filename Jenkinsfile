pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Stage: Checkout - Pulling latest code from repository...'
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                echo 'Stage: Verify Files - Checking that all required project files exist...'
                bat 'if not exist index.html (echo ERROR: index.html not found & exit /b 1)'
                bat 'if not exist src\\styles.css (echo ERROR: src\\styles.css not found & exit /b 1)'
                bat 'if not exist src\\main.js (echo ERROR: src\\main.js not found & exit /b 1)'
                echo 'All required files are present.'
            }
        }

        stage('Check JavaScript') {
            steps {
                echo 'Stage: Check JavaScript - Running syntax check on src/main.js...'
                bat '''
                    where node >nul 2>&1
                    if %ERRORLEVEL% neq 0 (
                        echo Node.js is not installed on this agent. Skipping JavaScript syntax check.
                    ) else (
                        echo Node.js found. Running syntax check...
                        node --check src\\main.js
                    )
                '''
            }
        }

        stage('Package') {
            steps {
                echo 'Stage: Package - Creating deployable archive of the site...'
                bat 'tar -a -cf recipe-box-site.zip index.html src'
                archiveArtifacts artifacts: 'recipe-box-site.zip', fingerprint: true
                echo 'Site packaged and archived successfully.'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Recipe Box site is verified, checked, and packaged.'
        }
        failure {
            echo 'Pipeline failed. Please review the stage logs above to identify the issue.'
        }
    }
}
