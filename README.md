# Torque Drift Frontend

## Configuração

### 1. WalletConnect Project ID

Para conectar corretamente com carteiras, você precisa configurar um Project ID do WalletConnect:

1. Acesse [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Crie uma conta e um novo projeto
3. Copie o Project ID gerado

### 2. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# WalletConnect Project ID (obrigatório)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu-project-id-aqui

# RPC URLs para BSC (opcionais, usam defaults se não definidos)
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
```

### 3. Instalação e Execução

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### 4. Conexão com Hardhat Local

Para conectar ao seu nó Hardhat local:

#### **Opção 1: Usando MetaMask**
1. Certifique-se de que o Hardhat está rodando: `npx hardhat node`
2. No MetaMask, adicione uma rede personalizada:
   - **Nome da rede**: Hardhat Local
   - **URL RPC**: `http://127.0.0.1:8545`
   - **ID da cadeia**: `31337`
   - **Símbolo da moeda**: `ETH`

#### **Opção 2: Usando RainbowKit (Recomendado)**
1. Execute o Hardhat: `npx hardhat node`
2. Na aplicação, clique em "Connect Wallet"
3. Selecione "Hardhat" na lista de redes
4. A aplicação se conectará automaticamente ao `http://127.0.0.1:8545`

#### **Importar Conta de Teste**
Após conectar, importe uma das contas do Hardhat no MetaMask:
- **Private Key**: Uma das chaves mostradas no terminal do Hardhat
- **Exemplo**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 5. Deploy dos Contratos

Antes de usar a aplicação, faça o deploy dos contratos no Hardhat:

```bash
# No diretório do projeto Hardhat
npx hardhat run scripts/deploy.ts --network localhost

# Copie os endereços dos contratos deployados para src/constants/index.ts
```

## Funcionalidades

- Conexão com carteiras via RainbowKit
- Exibição de saldos de tokens ($TOD) e BNB no header
- Sistema de claim de tokens
- Garage com carros equipáveis
- Sistema de apostas

## Problemas Conhecidos

- **CSP Errors**: Se você ver erros de Content Security Policy, isso é normal durante o desenvolvimento e não afeta a funcionalidade
- **Contract Errors**: Os contratos podem falhar se não estiverem implantados corretamente na rede selecionada

## Suporte

Para problemas com a configuração do WalletConnect, consulte a documentação oficial em [docs.walletconnect.com](https://docs.walletconnect.com/).
