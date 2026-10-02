const botaoLocalizacao =
    document.getElementById("btnLocalizacao");

const btnTempoReal =
    document.getElementById("btnTempoReal");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const ultimaLocalizacao =
    document.getElementById("ultimaLocalizacao");

const statusGps =
    document.getElementById("statusGps");

const papel =
    document.getElementById("papel");

const lixeira =
    document.getElementById("lixeira");


// ======================================================
// MAPA
// ======================================================

const mapa = L.map(
    "map"
).setView(
    [-14.235, -51.9253],
    4
);


L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

        maxZoom:
            19,

        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

    }
).addTo(
    mapa
);


let marcador =
    null;


let circuloPrecisao =
    null;


let watchId =
    null;


let tempoRealAtivo =
    false;


// ======================================================
// MOSTRAR POSIÇÃO NO MAPA
// ======================================================

function mostrarNoMapa(
    lat,
    long,
    precisao = null,
    moverMapa = true
) {

    if (
        moverMapa
    ) {

        mapa.setView(
            [
                lat,
                long
            ],
            17
        );

    }


    if (
        marcador === null
    ) {

        marcador =
            L.marker(
                [
                    lat,
                    long
                ]
            ).addTo(
                mapa
            );

    } else {

        marcador.setLatLng(
            [
                lat,
                long
            ]
        );

    }


    marcador.bindPopup(
        `
            <strong>📍 Você está aqui</strong>

            <br><br>

            Latitude:
            ${Number(lat).toFixed(6)}

            <br>

            Longitude:
            ${Number(long).toFixed(6)}
        `
    );


    if (
        circuloPrecisao
    ) {

        mapa.removeLayer(
            circuloPrecisao
        );


        circuloPrecisao =
            null;

    }


    if (
        precisao
    ) {

        circuloPrecisao =
            L.circle(
                [
                    lat,
                    long
                ],
                {

                    radius:
                        precisao,

                    weight:
                        2,

                    fillOpacity:
                        0.12

                }
            ).addTo(
                mapa
            );

    }

}


// ======================================================
// SALVAR LOCALIZAÇÃO
// ======================================================

function salvarLocalizacao(
    lat,
    long
) {

    localStorage.setItem(
        "latitude",
        lat
    );


    localStorage.setItem(
        "longitude",
        long
    );


    ultimaLocalizacao.textContent =
        `Sua última localização salva foi: ${Number(lat).toFixed(6)} / ${Number(long).toFixed(6)}`;

}


// ======================================================
// ATUALIZAR INTERFACE
// ======================================================

function atualizarInterface(
    position,
    emTempoReal = false
) {

    const lat =
        position.coords.latitude;


    const long =
        position.coords.longitude;


    const precisao =
        position.coords.accuracy;


    latitude.textContent =
        lat.toFixed(6);


    longitude.textContent =
        long.toFixed(6);


    salvarLocalizacao(
        lat,
        long
    );


    mostrarNoMapa(
        lat,
        long,
        precisao,
        true
    );


    if (
        emTempoReal
    ) {

        statusGps.textContent =
            `Localização em tempo real ativa • precisão aproximada: ${Math.round(precisao)} m`;

    } else {

        statusGps.textContent =
            `Localização encontrada • precisão aproximada: ${Math.round(precisao)} m`;

    }

}


// ======================================================
// ERROS
// ======================================================

function tratarErro(
    erro
) {

    switch (
        erro.code
    ) {

        case 1:

            statusGps.textContent =
                "Você negou a permissão de localização.";

            break;


        case 2:

            statusGps.textContent =
                "Não foi possível encontrar sua localização.";

            break;


        case 3:

            statusGps.textContent =
                "O GPS demorou demais para responder.";

            break;


        default:

            statusGps.textContent =
                "Ocorreu um erro ao acessar sua localização.";

    }

}


// ======================================================
// CARREGAR LOCALIZAÇÃO SALVA
// ======================================================

function carregarLocalizacaoSalva() {

    const latSalva =
        localStorage.getItem(
            "latitude"
        );


    const longSalva =
        localStorage.getItem(
            "longitude"
        );


    if (
        latSalva &&
        longSalva
    ) {

        latitude.textContent =
            Number(
                latSalva
            ).toFixed(
                6
            );


        longitude.textContent =
            Number(
                longSalva
            ).toFixed(
                6
            );


        ultimaLocalizacao.textContent =
            `Sua última localização salva foi: ${Number(latSalva).toFixed(6)} / ${Number(longSalva).toFixed(6)}`;


        statusGps.textContent =
            "Exibindo sua última localização salva.";


        mostrarNoMapa(
            Number(
                latSalva
            ),
            Number(
                longSalva
            ),
            null,
            true
        );

    } else {

        ultimaLocalizacao.textContent =
            "Nenhuma localização salva.";

    }

}


carregarLocalizacaoSalva();


// ======================================================
// LOCALIZAÇÃO ÚNICA
// ======================================================

botaoLocalizacao.addEventListener(
    "click",
    () => {

        if (
            !navigator.geolocation
        ) {

            statusGps.textContent =
                "Seu navegador não suporta geolocalização.";

            return;

        }


        botaoLocalizacao.disabled =
            true;


        botaoLocalizacao.textContent =
            "Localizando...";


        statusGps.textContent =
            "Solicitando acesso ao GPS...";


        navigator.geolocation.getCurrentPosition(

            (position) => {

                atualizarInterface(
                    position,
                    false
                );


                botaoLocalizacao.disabled =
                    false;


                botaoLocalizacao.innerHTML =
                    "<span>⌖</span> Atualizar localização";

            },


            (erro) => {

                tratarErro(
                    erro
                );


                botaoLocalizacao.disabled =
                    false;


                botaoLocalizacao.innerHTML =
                    "<span>⌖</span> Tentar novamente";

            },


            {

                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    0

            }

        );

    }
);


// ======================================================
// ATIVAR LOCALIZAÇÃO EM TEMPO REAL
// ======================================================

function ativarTempoReal() {

    if (
        !navigator.geolocation
    ) {

        statusGps.textContent =
            "Seu navegador não suporta geolocalização.";

        return;

    }


    if (
        tempoRealAtivo
    ) {

        return;

    }


    tempoRealAtivo =
        true;


    btnTempoReal.classList.add(
        "ativo"
    );


    btnTempoReal.innerHTML =
        "<span>●</span> Desativar localização em tempo real";


    statusGps.textContent =
        "Ativando localização em tempo real...";


    watchId =
        navigator.geolocation.watchPosition(

            (position) => {

                atualizarInterface(
                    position,
                    true
                );

            },


            (erro) => {

                tratarErro(
                    erro
                );


                desativarTempoReal(
                    false
                );

            },


            {

                enableHighAccuracy:
                    true,

                timeout:
                    15000,

                maximumAge:
                    1000

            }

        );

}


// ======================================================
// DESATIVAR LOCALIZAÇÃO EM TEMPO REAL
// ======================================================

function desativarTempoReal(
    mostrarMensagem = true
) {

    if (
        watchId !== null
    ) {

        navigator.geolocation.clearWatch(
            watchId
        );


        watchId =
            null;

    }


    tempoRealAtivo =
        false;


    btnTempoReal.classList.remove(
        "ativo"
    );


    btnTempoReal.innerHTML =
        "<span>●</span> Ativar localização em tempo real";


    if (
        mostrarMensagem
    ) {

        statusGps.textContent =
            "Localização em tempo real desativada.";

    }

}


// ======================================================
// BOTÃO TEMPO REAL
// ======================================================

btnTempoReal.addEventListener(
    "click",
    () => {

        if (
            tempoRealAtivo
        ) {

            desativarTempoReal();

        } else {

            ativarTempoReal();

        }

    }
);


// ======================================================
// DRAG AND DROP
// ======================================================

papel.addEventListener(
    "dragstart",
    (event) => {

        event.dataTransfer.setData(
            "text/plain",
            "localizacao"
        );


        setTimeout(
            () => {

                papel.style.opacity =
                    "0.45";

            },
            0
        );

    }
);


papel.addEventListener(
    "dragend",
    () => {

        papel.style.opacity =
            "1";


        lixeira.classList.remove(
            "ativa"
        );

    }
);


lixeira.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();

    }
);


lixeira.addEventListener(
    "dragenter",
    (event) => {

        event.preventDefault();


        lixeira.classList.add(
            "ativa"
        );

    }
);


lixeira.addEventListener(
    "dragleave",
    () => {

        lixeira.classList.remove(
            "ativa"
        );

    }
);


lixeira.addEventListener(
    "drop",
    (event) => {

        event.preventDefault();


        const item =
            event.dataTransfer.getData(
                "text/plain"
            );


        if (
            item !== "localizacao"
        ) {

            return;

        }


        // DESATIVAR GPS EM TEMPO REAL

        if (
            tempoRealAtivo
        ) {

            desativarTempoReal(
                false
            );

        }


        // LIMPAR LOCALSTORAGE

        localStorage.removeItem(
            "latitude"
        );


        localStorage.removeItem(
            "longitude"
        );


        // LIMPAR INTERFACE

        latitude.textContent =
            "---";


        longitude.textContent =
            "---";


        ultimaLocalizacao.textContent =
            "Nenhuma localização salva.";


        statusGps.textContent =
            "Localização salva apagada com sucesso.";


        // REMOVER MARCADOR

        if (
            marcador
        ) {

            mapa.removeLayer(
                marcador
            );


            marcador =
                null;

        }


        // REMOVER CÍRCULO DE PRECISÃO

        if (
            circuloPrecisao
        ) {

            mapa.removeLayer(
                circuloPrecisao
            );


            circuloPrecisao =
                null;

        }


        // VOLTAR MAPA PARA VISÃO GERAL

        mapa.setView(
            [
                -14.235,
                -51.9253
            ],
            4
        );


        lixeira.classList.remove(
            "ativa"
        );


        // ANIMAÇÃO DO PAPEL

        papel.style.opacity =
            "0";


        papel.style.transform =
            "scale(0.3)";


        setTimeout(
            () => {

                papel.style.opacity =
                    "1";


                papel.style.transform =
                    "scale(1)";

            },
            500
        );

    }
);


// ======================================================
// SEGURANÇA AO SAIR DA PÁGINA
// ======================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            watchId !== null
        ) {

            navigator.geolocation.clearWatch(
                watchId
            );

        }

    }
);