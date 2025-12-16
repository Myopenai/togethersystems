# Install Node.js dependencies
npm install

# Install TypeScript globally (if not already installed)
npm install -g typescript

# Install development dependencies
npm install --save-dev @types/node @types/jest ts-jest jest ts-node

# Install production dependencies
npm install fastify @fastify/cors @fastify/helmet @fastify/swagger @fastify/swagger-ui
npm install dotenv reflect-metadata typeorm pg winston pino-pretty
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken

# Create necessary directories
mkdir -p src/modules/users/entities
mkdir -p src/modules/users/dto
mkdir -p src/middleware
mkdir -p logs

# Initialize TypeScript
npx tsc --init

echo "Setup complete! Run 'npm run dev' to start the development server."
