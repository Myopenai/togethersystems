// Kubernetes Deployer - Generiert K8s Manifests
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import { Plan } from '../formula_selector';
import { Intent } from '../prompt_parser';

export function generateK8s(plan: Plan, intent: Intent): { deployment: string; service: string; ingress: string } {
  const appName = plan.category.toLowerCase().replace(/\s+/g, '-');
  
  const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  labels:
    app: ${appName}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${appName}:latest
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"`;

  const service = `apiVersion: v1
kind: Service
metadata:
  name: ${appName}
spec:
  selector:
    app: ${appName}
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP`;

  const ingress = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${appName}
spec:
  rules:
  - host: ${appName}.apple-pi.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${appName}
            port:
              number: 80`;

  return { deployment, service, ingress };
}

module.exports = { generateK8s };


