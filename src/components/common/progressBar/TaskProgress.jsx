import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import style from "./style.module.css";
import moment from "moment";
import { updateTaskSpendTime, updateTaskWhenPlay, updateTaskWhenCompleted } from "../../../api";

const Timer = (props) => {
    const { _id, spend_time, task_duration, start_time, status, task_percent } = props;
    const time = spend_time !== null ? spend_time.split(':') : `${0}:${0}:${0}:${0}`.split(":");
    const [second, setSecond] = useState('0');
    const [minute, setMinute] = useState('0');
    const [hour, setHour] = useState('0');
    const [day, setDay] = useState('0');
    const [range, setRange] = useState(0);
    const [play, setPlay] = useState(false);
    const [percent, setPercent] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const duration = moment.duration(task_duration).asSeconds();
    const [counter, setCounter] = useState(parseInt(time[3]) > 0 ? parseInt(time[3]) : 0);
    const handlePlay = async () => {
        if (!play) {
            setPlay(!play);
            console.log('play')
            const update = await updateTaskWhenPlay(_id, 'running', new Date().toISOString())
            if (update.status === 200) {
                console.log('started')
            }
        }

        if (play) {
            setPlay(!play);
            const sp_time = `${day}:${hour}:${minute}:${second}`;
            const update = await updateTaskSpendTime(_id, sp_time, percent, 'stop');
            if (update.status === 200) {
                console.log('updated')
            }
        }
    };
    useEffect(() => {
        let intervalId;

        if (play) {
            intervalId = setInterval(() => {
                const secondCounter = counter % 60;
                const minuteCounter = Math.floor(counter / 60);
                const hourCounter = Math.floor(counter / 3600);
                const dayCounter = Math.floor(counter / (3600 * 24));
                const computedSecond = String(secondCounter).length === 1 ? `0${secondCounter}` : secondCounter;
                const computedMinute = String(minuteCounter).length === 1 ? `0${minuteCounter}` : minuteCounter;
                const computedhoure = String(hourCounter).length === 1 ? `0${hourCounter}` : hourCounter;
                const computedDay = String(dayCounter).length === 1 ? `0${dayCounter}` : dayCounter;

                setSecond(parseInt(computedSecond));
                setMinute(parseInt(computedMinute) + parseInt(time[2]));
                setHour(parseInt(computedhoure) + parseInt(time[0]));
                setDay(parseInt(computedDay) + parseInt(time[0]));

                setCounter(counter => ++counter);
            }, 1000)
        }
        setPercent((100 * (((parseInt(day)) * 86400) + ((parseInt(hour)) * 3600) + ((parseInt(minute)) * 60) + (parseInt(second)))) / parseInt(duration));
        setCurrentTime(((parseInt(day)) * 86400) + ((parseInt(hour)) * 3600) + ((parseInt(minute)) * 60) + (parseInt(second)));
        if (currentTime === duration) {
            setPlay(!play)

        }
        // console.log(day, hour, minute, second, duration, parseInt(percent), counter % 60, counter, range)
        return () => clearInterval(intervalId);
    }, [play, counter])
    if (percent === 100) {
        async function request() {
            const sp_time = `${day}:${hour}:${minute}:${second}`;
            const update = await updateTaskWhenCompleted(_id, sp_time, 'completed')
            if (update.status === 200) {

            }
        }
        request();
    }
    useEffect(() => {
        if (status === 'running' && !play) {
            const diffInMs = Math.abs((new Date(start_time).getTime() - new Date().getTime()) / 1000);
            const resualt = Math.floor(diffInMs);
            setRange(parseInt(resualt));
            setCounter(parseInt(resualt) + parseInt(time[3]))
            setPlay(!play);
        }
    }, [range])

    useEffect(() => {
        setPercent(task_percent)
        setSecond(time[3])
        setMinute(time[2])
        setHour(time[1])
        setDay(time[0])
    }, [task_percent])
    console.log('percent', task_percent, percent)
    return (
        <div className="container">
            <Row>
                <Col xl="11" className="pl-0">
                    <Icon
                        // color={play && percent > 0 ? "" : `#4922ff`}
                        className={style.iconWatch}
                        icon="bi:clock-fill"
                    />
                    <ProgressBar
                        label={<><span>{`${parseInt(day)}:${parseInt(hour)}:${parseInt(minute)}:${parseInt(second)}`}</span></>}
                        now={status === 'completed' ? 100 : percent}
                        className={style.progress}
                    />
                </Col>
                <Col className={style.iconPlay} xl="1">
                    <div
                        onClick={handlePlay}
                        className={`${style.iconProgress}  text-center`}
                    >
                        {play ? (
                            <i><Icon icon="gg:play-pause" /></i>
                        ) : (
                            <Icon icon="bi:play-fill" />

                        )}
                    </div>
                </Col>
            </Row>
        </div>
    )
}
export default Timer;