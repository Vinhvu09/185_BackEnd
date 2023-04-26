import React, { useState } from 'react';
import arrow from '../../assets/svg/arrow_down.svg';
import MissionStatusItem from '../MissionStatusItem/MissionStatusItem';
import MissionStatusItemCreate from '../MissionStatusItemCreate/MissionStatusItemCreate';
import './MissionStatus.scss';
export default function MissionStatus({ data, name, status }) {
    const [isDropDown, setIsDropDown] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const handleOpenMissionCreate = () => {
        setIsOpen(true);
    };
    const handleDropDown = () => {
        setIsDropDown(!isDropDown);
    };
    return (
        <div className={`missionStatus ${status}`}>
            <div className={`circle ${isDropDown && 'open'}`} onClick={handleDropDown}>
                <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.0133 5.88369C5.83388 5.88426 5.65426 5.81439 5.51703 5.67424L1.19853 1.26169C0.923814 0.980993 0.922366 0.524489 1.19529 0.242173C1.46811 -0.0401439 1.91197 -0.0415524 2.18671 0.239027L6.00777 4.1435L9.80401 0.214992C10.0769 -0.067325 10.5208 -0.0687334 10.7953 0.211846C11.0702 0.492425 11.0716 0.948929 10.7986 1.23136L6.50822 5.67123C6.37181 5.81227 6.19264 5.88312 6.0133 5.88369Z" fill={`${status === 'assigning' ? '#434547' : 'white'}`} />
                </svg>
            </div>
            <div className="missionStatus__wrapper">
                <div className="title">
                    <div className="left" >
                        <div className="wrapper" onClick={handleDropDown}>
                            <div className="status">{name}</div>
                            <div className="num">{data?.length} nhiệm vụ</div>
                        </div>
                    </div>
                    {isDropDown && data &&
                        <div className="right">
                            <div className="wrapper">
                                <p>NGƯỜI THỰC HIỆN</p>
                                <p>THỜI GIAN</p>
                                <p></p>
                            </div>
                        </div>}

                </div>
                {isDropDown &&
                    <>
                        <div className="main">
                            {data?.map((e, index) => {
                                let getDataDate = new Date(e.end_date);
                                let hour = ('0' + getDataDate.getHours()).slice(-2) + ':' + ('0' + getDataDate.getMinutes()).slice(-2);
                                let date = ('0' + getDataDate.getDate()).slice(-2) + '/' + ('0' + (getDataDate.getMonth() + 1)).slice(-2) + '/' + (getDataDate.getFullYear());
                                return (
                                    <MissionStatusItem id={index} content={e.name} hour={hour} date={date} employees={e.employee} />
                                );
                            })}
                            {isOpen && <MissionStatusItemCreate setIsOpen={setIsOpen} />}
                        </div>
                        <div className={`add ${isOpen && 'hidden'}`} onClick={handleOpenMissionCreate}>
                            <div className="img">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM10 1.5C7.74566 1.5 5.58365 2.39553 3.98959 3.98959C2.39553 5.58365 1.5 7.74566 1.5 10C1.5 12.2543 2.39553 14.4163 3.98959 16.0104C5.58365 17.6045 7.74566 18.5 10 18.5C12.2543 18.5 14.4163 17.6045 16.0104 16.0104C17.6045 14.4163 18.5 12.2543 18.5 10C18.5 7.74566 17.6045 5.58365 16.0104 3.98959C14.4163 2.39553 12.2543 1.5 10 1.5ZM10 5C10.1989 5 10.3897 5.07902 10.5303 5.21967C10.671 5.36032 10.75 5.55109 10.75 5.75V9.25H14.25C14.4489 9.25 14.6397 9.32902 14.7803 9.46967C14.921 9.61032 15 9.80109 15 10C15 10.1989 14.921 10.3897 14.7803 10.5303C14.6397 10.671 14.4489 10.75 14.25 10.75H10.75V14.25C10.75 14.4489 10.671 14.6397 10.5303 14.7803C10.3897 14.921 10.1989 15 10 15C9.80109 15 9.61032 14.921 9.46967 14.7803C9.32902 14.6397 9.25 14.4489 9.25 14.25V10.75H5.75C5.55109 10.75 5.36032 10.671 5.21967 10.5303C5.07902 10.3897 5 10.1989 5 10C5 9.80109 5.07902 9.61032 5.21967 9.46967C5.36032 9.32902 5.55109 9.25 5.75 9.25H9.25V5.75C9.25 5.55109 9.32902 5.36032 9.46967 5.21967C9.61032 5.07902 9.80109 5 10 5Z" fill="#393B3D" />
                                </svg>
                            </div>
                            <p>Tạo nhiệm vụ</p>
                        </div>
                    </>
                }

            </div>
        </div>
    );
}
