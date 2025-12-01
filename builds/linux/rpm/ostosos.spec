Name:           ostosos
Version:        1.0.0
Release:        1%{?dist}
Summary:        OSTOSOS Operating System
License:        ISC
Source0:        %{name}-%{version}.tar.gz
BuildArch:      noarch
Requires:       chromium | firefox | google-chrome

%description
OSTOSOS Operating System - A complete offline operating system.

%prep
%setup -q

%build
# No build needed - static files

%install
mkdir -p %{buildroot}/usr/share/ostosos
cp -r * %{buildroot}/usr/share/ostosos/

%files
/usr/share/ostosos/*

%changelog
* $(date +"%a %b %d %Y") TogetherSystems <info@togethersystems.com> - 1.0.0-1
- Initial release
