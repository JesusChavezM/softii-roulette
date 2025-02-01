import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import * as XLSX from 'xlsx';
import  Confetii  from 'react-confetti';

const WheelComponent = () => {
    const [members, setMembers] = useState([]);
    const [winner, setWinner] = useState(null);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [rouletteData, setRouletteData] = useState([]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            const processedMembers = processMembers(jsonData);
            setMembers(shuffleArray(processedMembers));
            setRouletteData(processedMembers.map((member) => ({
                completeOption: member,
                option: member.split(' ')[0], // Solo el nombre
            })));
        };
        reader.readAsArrayBuffer(file);
    };

    const processMembers = (data) => {
        const membersList = [];
        data.forEach((row) => {
            const name = row.__EMPTY || row.Name;
            const surname = row.__EMPTY_1 || row.Surname;
            const RDI = row.RDI || 0;
            const RDE = row.RDE || 0;
            const VISITANTES = row.VISITANTES || 0;
            let opportunities = 0;

            if (name && name.toLowerCase() === 'total') {
                return;
            }

            opportunities += RDI;
            opportunities += RDE;
            opportunities += VISITANTES * 3;

            for (let i = 0; i < opportunities; i++) {
                membersList.push(`${name} ${surname}`);
            }
        });
        return membersList;
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const handleSpinClick = () => {
        const newPrizeNumber = Math.floor(Math.random() * rouletteData.length);
        setPrizeNumber(newPrizeNumber);
        setMustSpin(true);
    };

    useEffect(() => {
        const addShortString = members.map((member) => ({
            completeOption: member,
            option: member.split(' ')[0], // Solo el nombre
        }));
        setRouletteData(addShortString);
    }, [members]);

    

    return (
        <div className="flex flex-col h-screen w-screen">
            <header className="flex items-center justify-between w-full bg-[#141414] p-4 px-28 shadow-xs shadow-gray-200 sticky top-0 z-50">
                <h2 className="text-xl font-semibold text-white text-center">
                    BNI - Emprendedores del Desierto
                </h2>
                <div className='flex items-center justify-center border border-white p-2 rounded-md'>
                    <label htmlFor="archivo" className="cursor-pointer text-white rounded-md flex items-center">
                        <img src={`${process.env.PUBLIC_URL}/icons/description.svg`} alt='file' className='mr-2' />
                        Subir Excel
                    </label>
                    <input
                        id="archivo"
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            </header>
            <div className="flex flex-grow">
                {/* Contenedor izquierdo */}
                <div className="flex items-center justify-center w-1/2 min-h-screen">
                    <div className="flex flex-col items-start mx-16 mb-40">
                        <img src={`${process.env.PUBLIC_URL}/icons/softii_white.svg`} alt="roulette" />
                        <span className="text-white text-4xl mt-[22px]">¿Quién será el</span>
                        <span className="text-white text-4xl font-semibold">Ganador 💫✨</span>
                        <span className="text-white text-3xl">de ésta semana?</span>
                        <button
                            onClick={handleSpinClick}
                            disabled={mustSpin}
                            className="rounded-md p-2 bg-[#ED6A5A] cursor-pointer text-white font-semibold mt-[22px]"
                        >
                            Elegir Ganador
                        </button>
                    </div>
                </div>

                {/* Contenedor derecho */}
                <div className="flex justify-center items-center w-1/2">
                    {rouletteData.length > 0 && (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <div align="center" className="roulette-container relative">
                                <Wheel
                                    mustStartSpinning={mustSpin}
                                    prizeNumber={prizeNumber}
                                    data={rouletteData}
                                    outerBorderColor={["#ccc"]}
                                    outerBorderWidth={[3]}
                                    innerBorderColor={["#f2f2f2"]}
                                    radiusLineColor={["transparent"]}
                                    radiusLineWidth={[1]}
                                    textColors={["#f5f5f5"]}
                                    textDistance={65}
                                    fontSize={[10]}
                                    backgroundColors={["#141414", "#030303",]}
                                    startingOptionIndex={prizeNumber}
                                    onStopSpinning={() => {
                                        setMustSpin(false);
                                        setWinner(rouletteData[prizeNumber].completeOption);

                                    }}
                                    pointerProps={{
                                        src: `${process.env.PUBLIC_URL}/icons/pointerSpinner.svg`,
                                        style: {
                                            position: 'absolute',
                                            bottom: '0',
                                            right: '0',
                                            transform: 'rotate(157deg)',
                                      },
                                    }}
                                />
                                <button
                                    className="button roulette-button"
                                    onClick={handleSpinClick}
                                    disabled={mustSpin}
                                >
                                    <img src={`${process.env.PUBLIC_URL}/icons/softii_white_logo.svg`} alt="spin" />
                                </button>
                                {!mustSpin && winner && (
                                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black" style={{ top: '64px', left: 0, right: 0, bottom: 0 }}>
                                        {winner && <Confetii
                                            size={4}
                                            shape="circle"
                                            colors={['#f44336', '#9c27b0', '#3f51b5']}
                                            wind={0.01}
                                            gravity={0.2}
                                        /> }
                                        <div className="bg-black p-8 shadow-lg text-center w-[100vh - 58px]">
                                            <span className="text-white text-[72px]">¡Ganaste!</span>
                                            <p className="font-semibold text-white text-[110px]">{winner}</p>
                                            <div className="flex justify-center">
                                                <button className="rounded-md p-2 bg-[#141414] cursor-pointer text-white font-semibold mt-[22px] mr-6" onClick={() => setWinner(null)}>Regresar</button>
                                                <button onClick={() => { handleSpinClick(); setWinner(null); }} className="rounded-md p-2 bg-[#ED6A5A] cursor-pointer text-white font-semibold mt-[22px]" > Volver a Girar </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WheelComponent;