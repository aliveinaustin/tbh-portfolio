#!/usr/bin/env bash
# Adds a 2 GB swap file on the droplet. Safe to re-run: exits if swap already exists.
# Run with: sudo bash setup-swap.sh
set -euo pipefail

if swapon --show | grep -q .; then
  echo "Swap already active:"
  swapon --show
  exit 0
fi

fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Persist across reboots
grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Prefer RAM; only swap under real pressure
sysctl vm.swappiness=10
grep -q '^vm.swappiness' /etc/sysctl.conf \
  && sed -i 's/^vm.swappiness.*/vm.swappiness=10/' /etc/sysctl.conf \
  || echo 'vm.swappiness=10' >> /etc/sysctl.conf

echo "Swap enabled:"
swapon --show
free -m
