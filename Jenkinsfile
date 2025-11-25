def CURRENT_STAGE
def APPS_NAME    = 'user-auth-service'  //shoud be changed
def IMAGE_PREFIX = "kmplussmartsystem/${APPS_NAME}"
def REPO_HELM    = 'github.com/smartsystemkmplus/helm-user-auth-service' //shoud be changed
def EMAIL        = 'zulfikarwantogia9@gmail.com'
def USER_NAME    = 'zulfikarwantogia'
def BRANCH_NAME  = 'main'

//this is every stages for deploying into kubernetes clusters
pipeline {
  agent any
    environment {
    AWS_ACCOUNT_ID="592716879257"
    AWS_DEFAULT_REGION="ap-southeast-3"
    AWS_REPO_NAME="kmplussmartsystem/user-auth-service"
    REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${AWS_REPO_NAME}"
    }
  stages {
    stage ('ENV') {
      steps {
        script {
          CURRENT_STAGE=env.STAGE_NAME
          if (env.BRANCH_NAME == 'master') {
            MANIFEST_VALUE = 'values-prod.yaml'
            ENV_YAML = 'prod-'
          }
          if (env.BRANCH_NAME == 'develop') {
            MANIFEST_VALUE = 'values-stg.yaml'
            ENV_YAML = 'stg-'
          }
          // if (env.BRANCH_NAME == 'staging') {
          //   MANIFEST_VALUE = 'values-stg.yaml'
          //   ENV_YAML = 'stg-'
          // }
        }
      }
    }
    stage('SCM') {
        steps {
          node ('master') {
            checkout scm
          }
          script {
            CURRENT_STAGE=env.STAGE_NAME
          }
        }
    }

     stage('SonarQube Analysis') {
       environment {
         scannerHome = tool 'SonarScanner'
       }
       steps {
         node ('master') {
           script {
             CURRENT_STAGE=env.STAGE_NAME
             if (env.BRANCH_NAME == 'develop'){
           withSonarQubeEnv('SonarQube') {
             sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${APPS_NAME} -Dsonar.sources=. -Dsonar.host.url=http://167.99.70.51:9000 -Dsonar.login=admin"
           }
         }
      }
    }
  }
}

    stage('Build image') {   
      steps {
        node ('master') {    
          script {       
            CURRENT_STAGE=env.STAGE_NAME
            app = docker.build("${IMAGE_PREFIX}") 
          }   
        }
      }
    }
    stage('Push image') {
      steps {
        node ('master') {
          script {
            CURRENT_STAGE=env.STAGE_NAME
            if (env.BRANCH_NAME == 'master'){

            docker.withRegistry('https://592716879257.dkr.ecr.ap-southeast-3.amazonaws.com', 'ecr:ap-southeast-3:aws-credentials') {
              app.push("${ENV_YAML}${env.BUILD_NUMBER}")  
            }
          }
            if (env.BRANCH_NAME == 'develop'){
            CURRENT_STAGE=env.STAGE_NAME

            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
              app.push("${ENV_YAML}${env.BUILD_NUMBER}")             
          }
        }
      } 
    }
  }
}
  
    stage('Helm-Update'){
      steps {
        node ('master') {
          dir('helm'){
            git branch: "${BRANCH_NAME}", changelog: false, credentialsId: 'github-push', poll: false, url: "http://${USER_NAME}@${REPO_HELM}"
            withCredentials([usernamePassword(credentialsId: 'github-push', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
              sh "git config user.email ${EMAIL}"
              sh "git config user.name ${USER_NAME}"
              sh "sed  -i -e 's/tag:.*/tag: ${ENV_YAML}${env.BUILD_NUMBER}/g' ${MANIFEST_VALUE}"
              sh "git add ."
              sh "git commit -m 'Done by Jenkins Job changemanifest: ${env.BUILD_NUMBER}'"
              sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@${REPO_HELM} HEAD:main"
            }
          }
        }
      }
    }
  }
}
