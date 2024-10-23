import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import * as XLSX from 'xlsx';
import logo from '../../src/logo.svg';

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
        <div className="flex h-screen w-screen relative">
            <div className="flex flex-col items-center w-1/2 p-4">
                <div className="flex items-center space-x-10">
                    <img src={logo} alt="spin" className='w-[150px] h-[150px] spin' />
                    <h2 className="text-5xl font-semibold text-white">
                        Rifa Emprendedores del Desierto BNI
                    </h2>
                </div>
                {rouletteData.length > 0 && (
                    <div className='w-full mt-10 pl-[135px]'>
                        <h3 className="text-xl font-semibold mb-2 text-white">Miembros ({members.length}):</h3>
                        <div className="overflow-y-auto h-[380px] p-4 rounded-md shadow-sm">
                            <ul>
                                {members.map((member, index) => (
                                    <li key={index} className="text-white">-{member}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                <div className='flex items-center justify-center w-full'>
                    <label className="mt-4">
                        <span className="sr-only">Choose file</span>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-black
                                    hover:file:bg-red-50"
                        />
                    </label>
                </div>
            </div>

            <div className="flex justify-center items-center w-1/2 h-full">
                {rouletteData.length > 0 && (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <div align="center" className="roulette-container">
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
                                textDistance={55}
                                fontSize={[10]}
                                backgroundColors={[
                                    "#141414", "#030303",
                                ]}
                                onStopSpinning={() => {
                                    setMustSpin(false);
                                    setWinner(rouletteData[prizeNumber].completeOption);
                                }}
                            />
                            <button
                                className="button roulette-button"
                                onClick={handleSpinClick}
                                disabled={mustSpin}
                            >
                                <img src={logo} alt="spin" />
                            </button>
                            {!mustSpin && winner && (
                                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
                                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                                        <p className="text-2xl font-semibold text-black">
                                            Ganador: {winner}
                                        </p>
                                        <button
                                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                                            onClick={() => setWinner(null)}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WheelComponent;
