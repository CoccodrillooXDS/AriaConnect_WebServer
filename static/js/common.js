document.addEventListener('DOMContentLoaded', function () {
    updateThemeSelection(getStoredTheme());

    window.addEventListener('resize', fixNav);
    fixNav();

    window.addEventListener('resize', fixSponsor);
    fixSponsor();

    const navbarNav = document.getElementById('navbarNav');
    if (navbarNav) {
        navbarNav.addEventListener('shown.bs.collapse', fixNav);
        navbarNav.addEventListener('hidden.bs.collapse', fixNav);
    }



    try {
        const nomeIstituto = document.getElementById('nomeIstituto');
        if (nomeIstituto) {
            nomeIstituto.setAttribute('data-bs-toggle', 'tooltip');
            nomeIstituto.setAttribute('data-bs-html', 'true');
            nomeIstituto.setAttribute('data-bs-placement', 'bottom');
            nomeIstituto.setAttribute('data-bs-delay', '{"show": 150, "hide": 2500}');
            nomeIstituto.setAttribute('data-bs-boundary', 'viewport');
            nomeIstituto.setAttribute('data-bs-container', 'body');
            nomeIstituto.setAttribute('data-bs-custom-class', 'tooltips');
            nomeIstituto.setAttribute('data-bs-title', `
                <div class='d-flex flex-column align-items-start'>
                    <a href='https://sway.cloud.microsoft/O2nx8uNB1DFmpG9z?ref=Link' target='_blank'
                        class='link-body-emphasis fw-bold text-decoration-none'>
                        <i class='bi bi-caret-right-fill'></i> Telecomunicazioni
                    </a>
                    <a href='https://www.iiscastelli.edu.it/Pager.aspx?Page=dip_info_info' target='_blank'
                        class='link-body-emphasis fw-bold text-decoration-none'>
                        <i class='bi bi-caret-right-fill'></i> Informatica
                    </a>
                </div>
            `);
        }

        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    } catch (error) {
        console.error('An error occurred while setting the tooltip:', error);
    }
});

try {
    MathJax = {
        options: {
            enableMenu: false,
        }
    };
} catch (error) {
    console.error('An error occurred while setting MathJax options:', error);
}

function fixNav() {
    let navHeight = document.querySelector('#supBar').offsetHeight;

    if (typeof isDashboard === 'undefined') {
        document.getElementById('realBody').style.marginTop = (navHeight + 10) + 'px';
        document.documentElement.style.scrollPaddingTop = (navHeight + 74) + 'px';
    } else {
        document.getElementById('realBody').style.marginTop = navHeight + 'px';
        document.documentElement.style.scrollPaddingTop = (navHeight + 64) + 'px';
    }
}

function fixSponsor() {
    const sponsors = document.querySelectorAll('.sponsor');

    sponsors.forEach((sponsor, index) => {
        const sponsorImg = sponsor.querySelector('img');
        const sponsorDiv = sponsor.querySelector('div');

        let innerWidth = 1200;

        if (sponsor.id === 'welcomeUsersSponsor') {
            innerWidth = 1500;
        }

        if (window.innerWidth > innerWidth) {
            try {
                if (sponsorImg) {
                    sponsorImg.classList.remove('order-0');
                }
                if (sponsorDiv) {
                    sponsorDiv.classList.remove('order-1');
                }
            } catch (error) {
                console.error('An error occurred while removing classes:', error);
            }
        } else {
            try {
                if (sponsorImg) {
                    sponsorImg.classList.add('order-0');
                }
                if (sponsorDiv) {
                    sponsorDiv.classList.add('order-1');
                }
            } catch (error) {
                console.error('An error occurred while adding classes:', error);
            }
        }
    });
}

function showAlert(message, alertType) {
    const alertContainer = document.getElementById('alert-container');

    alertContainer.style.setProperty('padding-bottom', '15px', 'important');

    alertContainer.style.setProperty('display', 'block', 'important');

    // remove style attributes from message
    // Parse the message as HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(message, 'text/html');
    // Remove style attributes from all elements
    doc.querySelectorAll('[style]').forEach(el => el.removeAttribute('style'));
    // Serialize back to a string
    message = new XMLSerializer().serializeToString(doc.body).replace(/<\/?body>/g, '');

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${alertType} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
                  ${message}
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Chiudi"></button>
                  `;
    alertContainer.appendChild(alertElement);

    const bsAlert = new bootstrap.Alert(alertElement);

    alertElement.addEventListener('closed.bs.alert', function () {
        if (alertContainer.childElementCount === 0) {
            alertContainer.style.setProperty('padding-bottom', '0', 'important');
            alertContainer.style.setProperty('display', 'none', 'important');
        }
    });

    setTimeout(function () {
        bsAlert.close();
    }, 3500);
}

function loadTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function openModal(element) {
    if (element.classList.contains('tooltip-trigger')) {
        const tooltip = bootstrap.Tooltip.getInstance(element);
        tooltip.hide();
    }

    var modalImage = document.getElementById('modalImage');
    var modal = document.getElementById('photoModal');
    var modalBody = modal.querySelector('.modal-body');
    modalImage.remove();

    if (element.tagName === 'DIV') {
        var elementClone = element.parentElement.cloneNode(true);
        elementClone.id = 'modalImage';
        try {
            elementClone.classList.remove('img-bigimg', 'img-biggerimg', 'img-biggestimg');
            // remove onClick also recursively
            var children = elementClone.getElementsByTagName('*');
            for (var i = 0; i < children.length; i++) {
                children[i].onclick = null;
            }

            // Copy 
        } catch (error) {
            pass;
        }
        modalBody.appendChild(elementClone);
    } else {
        // add an img tag to the modal
        var img = document.createElement('img');
        img.classList.add('img-fluid');
        img.id = 'modalImage';
        img.src = element.src;
        modalBody.appendChild(img);    
    }

    loadTooltips();
    
    var photoModal = new bootstrap.Modal(document.getElementById('photoModal'));
    photoModal.show();
}