import solcx
import json

# Install solc 0.8.20
solcx.install_solc('0.8.20')
solcx.set_solc_version('0.8.20')

with open('/app/MultiTokenLendingVault.sol', 'r') as f:
    source = f.read()

compiled = solcx.compile_source(
    source,
    output_values=['abi', 'bin'],
    solc_version='0.8.20'
)

contract_id = '<stdin>:MultiTokenLendingVault'
contract = compiled[contract_id]

print("=== ABI ===")
print(json.dumps(contract['abi']))
print("\n=== BYTECODE ===")
print("0x" + contract['bin'])
