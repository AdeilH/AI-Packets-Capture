#!/bin/bash

# Create a pinned requirements file with versions compatible with Python 3.9
cat > requirements-pinned.txt << EOF
numpy==1.26.4
pandas==2.0.3
pyshark==0.6
requests==2.31.0
flask==2.3.3
flask-cors==4.0.0
scikit-learn==1.4.0
EOF

echo "Created pinned requirements file with Python 3.9 compatible packages" 