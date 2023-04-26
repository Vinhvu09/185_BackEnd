import { yupResolver } from "@hookform/resolvers/yup"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import Swal from "sweetalert2"
import * as yup from "yup"
import Error from "../../../../../../components/Error/Error"
import {
  addBackendDataSchedule,
  addEditSchedule,
  resetErrorState
} from "../../../../../../store/Reducer/meetingReducer"
import CheckTypeSchedule from "../../../DateItem/components/Input/CheckTypeSchedule/CheckTypeSchedule"
import DateInputSchedule from "../../../DateItem/components/Input/DateInputSchedule/DateInputSchedule"
import InputSchedule from "../../../DateItem/components/Input/InputSchedule/InputSchedule"
import MemberInputSchedule from "../../../DateItem/components/Input/MemberInputSchedule/MemberInputSchedule"
import TextAreaSchedule from "../../../DateItem/components/Input/TextAreaSchedule/TextAreaSchedule"
import TimeInputSchedule from "../../../DateItem/components/Input/TimeInputSchedule/TimeInputSchedule"
import "./EditScheduleMain.scss"

const today = new Date()
today.setHours(0, 0, 0, 0)
//shema yup
const schema = yup.object().shape({
  name: yup.string().required("* Tên cuộc hẹn không được để trống"),
  description: yup
    .string()
    .required("* Nội dung cuộc hẹn không được để trống"),

  schedule_date: yup
    .date()
    .required("* Ngày tạo cuộc họp không được để trống")
    .min(today, "* Ngày tạo cuộc họp đã qua"),
  type: yup.string().required("* Vui lòng chọn loại cuộc họp"),
  employees: yup.array().of(yup.object()).required("* Vui lòng chọn ít nhất 1 nhân viên").test({ message: "* Vui lòng chọn ít nhất 1 nhân viên", test: arr => arr?.length > 0 })
})

export default function EditScheduleMain({ funcSetStartDate }) {
  //redux
  const dispatch = useDispatch()

  //reducers
  const { editSchedule, backendDataSchedules } = useSelector(store => store.meeting)
  const { dataDepartmentUser } = useSelector((store) => store.department)


  //react hook form

  const methods = useForm({ resolver: yupResolver(schema) })
  const { handleSubmit,
    setError,
    control,
    register,
    reset,
    formState: { errors } } = methods
  function getUsersIDMeetingToArray(usersMeeting) {
    let arrayID = []
    for (let index = 0; index < usersMeeting.length; index++) {
      const element = usersMeeting[index]
      arrayID = [...arrayID, element.id]
    }
    return arrayID
  }
  const swalScheduleEdit = Swal.mixin({
    customClass: {
      confirmButton: "sweertAlert__cancelSchedule",
      cancelButton: "sweertAlert__saveSchedule",
    },
    buttonsStyling: false,
  })
  useEffect(() => {
    // dispatch(getDepartmentUserStart())
    if (editSchedule) {
      const newDate = new Date(editSchedule.schedule_date)
      const hourMeetingStart = editSchedule.start_at.slice(0, 2)
      const minuteMeetingStart = editSchedule.start_at.slice(3, 5)
      const hourMeetingEnd = editSchedule.end_at.slice(0, 2)
      const minuteMeetingEnd = editSchedule.end_at.slice(3, 5)
      reset({
        name: editSchedule.name,
        description: editSchedule.description,
        schedule_date: newDate,
        hourMeetingStart: hourMeetingStart,
        minuteMeetingStart: minuteMeetingStart,
        hourMeetingEnd: hourMeetingEnd,
        minuteMeetingEnd: minuteMeetingEnd,
        type: editSchedule.type,
        employees: editSchedule.employees
      })

    }
  }, [editSchedule])
  const onSubmit = (data) => {
    dispatch(resetErrorState())
    const { hourMeetingStart, minuteMeetingStart, hourMeetingEnd, minuteMeetingEnd, ...newData } = data
    if (
      !hourMeetingStart ||
      !minuteMeetingStart ||
      !hourMeetingEnd ||
      !minuteMeetingEnd
    ) {
      setError("meeting_time", {
        type: "custom",
        message: "* Nhập thiếu thời gian cuộc họp",
      })
    } else if (
      (hourMeetingStart * 60 + minuteMeetingStart) -
      (hourMeetingEnd * 60 + minuteMeetingEnd) > 0
    ) {
      setError("meeting_time", {
        type: "custom",
        message: "* Thời gian bắt đầu và kết thúc không hợp lý",
      })
    } else if (
      hourMeetingEnd * 60 +
      minuteMeetingEnd -
      (hourMeetingStart * 60 + minuteMeetingStart) <
      15
    ) {
      setError("meeting_time", {
        type: "custom",
        message: "* Cuộc họp tối thiếu phải trong 15 phút",
      })
    } else {
      let dataSchedule = { ...newData }
      const { schedule_date } = dataSchedule
      dataSchedule.schedule_date = `${schedule_date.getFullYear()}-${schedule_date.getMonth() < 10
        ? `0${schedule_date.getMonth() + 1}`
        : schedule_date.getMonth() + 1
        }-${schedule_date.getDate() < 10 ? `0${schedule_date.getDate()}` : schedule_date.getDate()}`
      dataSchedule.start_at = `${hourMeetingStart}:${minuteMeetingStart}:00`
      dataSchedule.end_at = `${hourMeetingEnd}:${minuteMeetingEnd}:00`
      dataSchedule.id = editSchedule.id
      const newBackendData = [...backendDataSchedules]
      const newDataEdited = newBackendData.map((data) => {
        if (data.id === dataSchedule.id) {
          return dataSchedule
        }
        else {
          return data
        }
      })
      // newBackendData.push(dataSchedule);
      dispatch(addBackendDataSchedule(newDataEdited))
      dispatch(addEditSchedule(dataSchedule))

      funcSetStartDate(schedule_date)
      document.querySelector(".editScheduleMain").style.display = "none"
    }
  }

  const handleClickCancel = () => {
    document.querySelector(".editScheduleMain").style.display = "none"
  }

  const handleClickOutModal = (e) => {
    if (e.target.matches(".editScheduleMain")) {
      document.querySelector(".editScheduleMain").style.display = "none"
    }
  }

  const swalScheduleDelete = Swal.mixin({
    customClass: {
      confirmButton: "sweertAlert__cancelSchedule",
      cancelButton: "sweertAlert__saveSchedule",
    },
    buttonsStyling: false,
  })

  const handleClickDeleteSchedule = () => {

    swalScheduleDelete
      .fire({
        html: `<svg className="sweertAlert__iconWarningEditSchedule"width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="52" height="52" rx="26" fill="#E13F3F"/>
      <g clip-path="url(#clip0_1896_137514)">
      <path d="M30.0832 35.4688C30.0832 37.9673 28.0271 40 25.4998 40C22.9726 40 20.9165 37.9673 20.9165 35.4688C20.9165 32.9702 22.9726 30.9375 25.4998 30.9375C28.0271 30.9375 30.0832 32.9702 30.0832 35.4688ZM21.447 12.4273L22.2262 27.8335C22.2628 28.557 22.8668 29.125 23.5995 29.125H27.4002C28.1329 29.125 28.7369 28.557 28.7735 27.8335L29.5527 12.4273C29.5919 11.6508 28.9658 11 28.1794 11H22.8203C22.0339 11 21.4078 11.6508 21.447 12.4273Z" fill="white"/>
      </g>
      <defs>
      <clipPath id="clip0_1896_137514">
      <rect width="11" height="29" fill="white" transform="translate(20 11)"/>
      </clipPath>
      </defs>
      </svg>
       <p className="sweertAlert__titleEditSchedule" style="font-weight:600;font-size:24px;color:#393b3d;margin-top:8px;">Bạn có chắc xoá</p>
       <span className="sweertAlert__contentEditSchedule" style="font-weight:400;font-size:16px;color:#393b3d;margin-top:8px;">Hành động xoá sẽ không được hoàn tác<br/>tiếp tục</span>

       `,

        showCancelButton: true,
        confirmButtonText: "Trở về",
        cancelButtonText: "Tiếp tục",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // const response = await deleteAxios(`schedules/${idScheduleUpdate}`)
          // if (response.success === true) {
          //   let dataString = new Date(
          //     `${dateMeetingUpdate.getMonth() + 1
          //     }/${dateMeetingUpdate.getDate()}/${dateMeetingUpdate.getFullYear()}`
          //   )
          const editedData = [...backendDataSchedules].filter(data => data.id !== editSchedule.id)
          dispatch(addBackendDataSchedule(editedData))
          funcSetStartDate(new Date(editSchedule.schedule_date))
          const editForm = document.querySelector(".editScheduleMain")
          const viewDetail = document.querySelector(".viewDetail")
          editForm.style.display = "none"
          viewDetail.style.display = "none"
        }
      }
      )
  }
  return (
    <div className="editScheduleMain" onClick={handleClickOutModal}>
      <div className="editScheduleMain__main">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="editScheduleMain__main--close"
          onClick={handleClickCancel}
        >
          <path
            d="M8.40994 7.00019L12.7099 2.71019C12.8982 2.52188 13.004 2.26649 13.004 2.00019C13.004 1.73388 12.8982 1.47849 12.7099 1.29019C12.5216 1.10188 12.2662 0.996094 11.9999 0.996094C11.7336 0.996094 11.4782 1.10188 11.2899 1.29019L6.99994 5.59019L2.70994 1.29019C2.52164 1.10188 2.26624 0.996094 1.99994 0.996094C1.73364 0.996094 1.47824 1.10188 1.28994 1.29019C1.10164 1.47849 0.995847 1.73388 0.995847 2.00019C0.995847 2.26649 1.10164 2.52188 1.28994 2.71019L5.58994 7.00019L1.28994 11.2902C1.19621 11.3832 1.12182 11.4938 1.07105 11.6156C1.02028 11.7375 0.994141 11.8682 0.994141 12.0002C0.994141 12.1322 1.02028 12.2629 1.07105 12.3848C1.12182 12.5066 1.19621 12.6172 1.28994 12.7102C1.3829 12.8039 1.4935 12.8783 1.61536 12.9291C1.73722 12.9798 1.86793 13.006 1.99994 13.006C2.13195 13.006 2.26266 12.9798 2.38452 12.9291C2.50638 12.8783 2.61698 12.8039 2.70994 12.7102L6.99994 8.41019L11.2899 12.7102C11.3829 12.8039 11.4935 12.8783 11.6154 12.9291C11.7372 12.9798 11.8679 13.006 11.9999 13.006C12.132 13.006 12.2627 12.9798 12.3845 12.9291C12.5064 12.8783 12.617 12.8039 12.7099 12.7102C12.8037 12.6172 12.8781 12.5066 12.9288 12.3848C12.9796 12.2629 13.0057 12.1322 13.0057 12.0002C13.0057 11.8682 12.9796 11.7375 12.9288 11.6156C12.8781 11.4938 12.8037 11.3832 12.7099 11.2902L8.40994 7.00019Z"
            fill="#434547"
          />
        </svg>
        <h1>Chỉnh sửa lịch</h1>
        <FormProvider {...methods}>
          <form
            className="editScheduleMain__main--form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputSchedule
              control={control}
              name="name"
              id="name"
              title="Tên cuộc hẹn"
              width="100%"
              error={errors.name ? errors.name.message : ""}
            />
            <TextAreaSchedule
              control={control}
              name="description"
              id="description"
              title="Nội dung cuộc hẹn"
              width="100%"
              rows="8"
              cols="34"
              error={errors.description ? errors.description.message : ""}
            />

            <div className="center">
              <DateInputSchedule
                control={control}
                name="schedule_date"
                id="schedule_date"
                title="Ngày"
                width="30%"
                error={errors.schedule_date ? errors.schedule_date.message : ""}
              />

              <div className="meetingTime">
                <span className="meetingTime__title">Thời gian</span>

                <div className="meetingTime__time">
                  <span className="meetingTime__time--left">Từ</span>
                  <div className="meetingTime__time--right">
                    <TimeInputSchedule
                      control={control}
                      name="hourMeetingStart"
                      id="hourMeetingStart"
                      type="hours"
                    />

                    <span>giờ</span>
                    <TimeInputSchedule
                      control={control}
                      name="minuteMeetingStart"
                      id="minuteMeetingStart"
                      type="minutes"
                    />
                    <span>phút</span>
                  </div>
                </div>
                <div className="meetingTime__time">
                  <span className="meetingTime__time--left">Đến</span>
                  <div className="meetingTime__time--right">
                    <TimeInputSchedule
                      control={control}
                      name="hourMeetingEnd"
                      id="hourMeetingEnd"
                      type="hours"
                    />
                    <span>giờ</span>
                    <TimeInputSchedule
                      control={control}
                      name="minuteMeetingEnd"
                      id="minuteMeetingEnd"
                      type="minutes"
                    />
                    <span>phút</span>
                  </div>
                </div>
                {errors[`meeting_time`] && <Error message={errors[`meeting_time`].message} />}
              </div>

              <CheckTypeSchedule name="type" state="edit" />
            </div>
            {errors.meeting_date && (
              <p className="date_item_errors">{errors.meeting_date.message}</p>
            )}
            <span className="participants">Người tham gia</span>
            <div className="listInputUser">
              {dataDepartmentUser &&
                dataDepartmentUser.map((item, index) => {
                  return (
                    <MemberInputSchedule
                      key={item.id}
                      name={item.name}
                      users={item.employee_joined_list}
                      width="30%"
                      state="edit"

                    />
                  )
                })}
            </div>

            <p className="date_item_errors">{`${errors.meeting_users ? errors.meeting_users.message : ""
              }`}</p>

            <div className="groupButton">
              <div
                className="groupButton__delete"
                onClick={handleClickDeleteSchedule}
              >
                <svg
                  width="21"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.0189 18.387C15.6233 18.387 15.2256 18.387 14.83 18.387C13.8797 18.387 12.9314 18.387 11.9811 18.387C10.8466 18.387 9.71212 18.387 8.57552 18.387C7.60009 18.387 6.62466 18.387 5.64924 18.387C5.20129 18.387 4.75126 18.389 4.30332 18.387C4.22377 18.387 4.14423 18.3809 4.06469 18.3729C4.13795 18.3829 4.21331 18.393 4.28657 18.4011C4.13795 18.3809 3.99352 18.3446 3.85328 18.2902C3.92026 18.3164 3.98724 18.3446 4.05423 18.3708C3.9098 18.3124 3.77583 18.2378 3.65233 18.145C3.70885 18.1874 3.76537 18.2297 3.82188 18.272C3.70676 18.1854 3.60419 18.0866 3.51418 17.9757C3.55814 18.0301 3.6021 18.0845 3.64605 18.139C3.55186 18.02 3.47232 17.891 3.41162 17.7519C3.43883 17.8164 3.46813 17.8809 3.49534 17.9454C3.43883 17.8104 3.40115 17.6712 3.38022 17.5281C3.39068 17.5987 3.40115 17.6712 3.40952 17.7418C3.3865 17.5624 3.39487 17.3789 3.39487 17.1995C3.39487 16.8769 3.39487 16.5543 3.39487 16.2317C3.39487 15.7418 3.39487 15.2519 3.39487 14.762C3.39487 14.1591 3.39487 13.5543 3.39487 12.9515C3.39487 12.2902 3.39487 11.6289 3.39487 10.9676C3.39487 10.2942 3.39487 9.62079 3.39487 8.94942C3.39487 8.32038 3.39487 7.69135 3.39487 7.06231C3.39487 6.53207 3.39487 6.00182 3.39487 5.47359C3.39487 5.09053 3.39487 4.70544 3.39487 4.32238C3.39487 4.14092 3.39696 3.95947 3.39487 3.77802C3.39487 3.76995 3.39487 3.76189 3.39487 3.75382C3.11648 4.02197 2.83599 4.29213 2.55759 4.56028C2.69365 4.56028 2.82971 4.56028 2.96367 4.56028C3.33208 4.56028 3.70257 4.56028 4.07097 4.56028C4.61311 4.56028 5.15734 4.56028 5.69947 4.56028C6.36511 4.56028 7.03074 4.56028 7.69638 4.56028C8.42481 4.56028 9.15533 4.56028 9.88376 4.56028C10.6206 4.56028 11.3553 4.56028 12.0921 4.56028C12.7786 4.56028 13.4652 4.56028 14.1518 4.56028C14.7295 4.56028 15.3072 4.56028 15.8849 4.56028C16.3015 4.56028 16.7201 4.56028 17.1367 4.56028C17.3355 4.56028 17.5323 4.5623 17.7311 4.56028C17.7395 4.56028 17.7479 4.56028 17.7562 4.56028C17.4779 4.29213 17.1974 4.02197 16.919 3.75382C16.919 3.87883 16.919 4.00383 16.919 4.12883C16.919 4.46552 16.919 4.80423 16.919 5.14093C16.919 5.64093 16.919 6.14295 16.919 6.64295C16.919 7.25384 16.919 7.86272 16.919 8.47361C16.919 9.13692 16.919 9.80023 16.919 10.4656C16.919 11.1369 16.919 11.8083 16.919 12.4797C16.919 13.1027 16.919 13.7257 16.919 14.3486C16.919 14.8688 16.919 15.389 16.919 15.9091C16.919 16.2781 16.919 16.6491 16.919 17.018C16.919 17.1813 16.919 17.3446 16.919 17.5079C16.919 17.5866 16.9148 17.6632 16.9043 17.7418C16.9148 17.6712 16.9253 17.5987 16.9336 17.5281C16.9127 17.6712 16.875 17.8104 16.8185 17.9454C16.8457 17.8809 16.875 17.8164 16.9022 17.7519C16.8415 17.891 16.7641 18.02 16.6678 18.139C16.7117 18.0845 16.7557 18.0301 16.7997 17.9757C16.7097 18.0866 16.6071 18.1854 16.492 18.272C16.5485 18.2297 16.605 18.1874 16.6615 18.145C16.538 18.2358 16.404 18.3124 16.2596 18.3708C16.3266 18.3446 16.3936 18.3164 16.4606 18.2902C16.3203 18.3446 16.1759 18.3809 16.0273 18.4011C16.1005 18.391 16.1759 18.3809 16.2492 18.3729C16.1738 18.3829 16.0963 18.387 16.0189 18.387C15.8033 18.389 15.5793 18.4757 15.4265 18.6229C15.2821 18.762 15.1712 18.9918 15.1816 19.1934C15.2026 19.6269 15.55 20.0039 16.0189 19.9999C16.718 19.9938 17.4234 19.7176 17.8965 19.2156C18.3382 18.7479 18.5914 18.1511 18.5956 17.516C18.5977 17.3527 18.5956 17.1874 18.5956 17.0241C18.5956 16.6148 18.5956 16.2055 18.5956 15.7982C18.5956 15.2095 18.5956 14.6208 18.5956 14.0321C18.5956 13.3365 18.5956 12.643 18.5956 11.9474C18.5956 11.2115 18.5956 10.4756 18.5956 9.74176C18.5956 9.03006 18.5956 8.32038 18.5956 7.60868C18.5956 6.99779 18.5956 6.38489 18.5956 5.774C18.5956 5.3244 18.5956 4.8748 18.5956 4.4252C18.5956 4.21149 18.5977 3.99576 18.5956 3.78205C18.5956 3.77197 18.5956 3.76391 18.5956 3.75382C18.5956 3.31834 18.2126 2.94737 17.7583 2.94737C17.6223 2.94737 17.4862 2.94737 17.3523 2.94737C16.9839 2.94737 16.6134 2.94737 16.245 2.94737C15.7028 2.94737 15.1586 2.94737 14.6165 2.94737C13.9508 2.94737 13.2852 2.94737 12.6196 2.94737C11.8911 2.94737 11.1606 2.94737 10.4322 2.94737C9.69537 2.94737 8.96066 2.94737 8.22386 2.94737C7.53729 2.94737 6.85073 2.94737 6.16416 2.94737C5.58644 2.94737 5.00872 2.94737 4.431 2.94737C4.01446 2.94737 3.59582 2.94737 3.17927 2.94737C2.98042 2.94737 2.78366 2.94535 2.58481 2.94737C2.57643 2.94737 2.56806 2.94737 2.55969 2.94737C2.10756 2.94737 1.72241 3.31632 1.72241 3.75382C1.72241 4.18125 1.72241 4.60665 1.72241 5.03407C1.72241 6.06231 1.72241 7.09255 1.72241 8.12078C1.72241 9.39095 1.72241 10.6591 1.72241 11.9293C1.72241 13.0825 1.72241 14.2357 1.72241 15.387C1.72241 16.0482 1.72241 16.7075 1.72241 17.3688C1.72241 17.8466 1.80823 18.3083 2.05104 18.7317C2.50317 19.5241 3.39906 19.9979 4.32843 19.9999C4.96686 19.9999 5.60528 19.9999 6.2437 19.9999C7.4745 19.9999 8.70739 19.9999 9.93818 19.9999C11.1983 19.9999 12.4563 19.9999 13.7164 19.9999C14.449 19.9999 15.1816 19.9999 15.9121 19.9999C15.9477 19.9999 15.9833 19.9999 16.0189 19.9999C16.4564 19.9999 16.8771 19.6289 16.8562 19.1934C16.8352 18.7579 16.4878 18.387 16.0189 18.387Z"
                    fill="#E62614"
                  />
                  <path
                    d="M12.6071 3.18822e-05C12.2366 3.18822e-05 11.864 3.18822e-05 11.4935 3.18822e-05C10.763 3.18822e-05 10.0304 3.18822e-05 9.29986 3.18822e-05C8.7954 3.18822e-05 8.29094 3.18822e-05 7.78648 3.18822e-05C7.36157 3.18822e-05 6.92409 0.0907582 6.57034 0.32463C5.96541 0.719794 5.59491 1.34681 5.59073 2.0565C5.58654 2.60489 5.59073 3.15328 5.59073 3.70167C5.59073 3.71981 5.59073 3.73796 5.59073 3.7561C5.59073 4.19159 5.97378 4.56256 6.428 4.56256C6.675 4.56256 6.922 4.56256 7.16899 4.56256C7.76346 4.56256 8.35583 4.56256 8.9503 4.56256C9.67245 4.56256 10.3946 4.56256 11.1168 4.56256C11.7384 4.56256 12.358 4.56256 12.9797 4.56256C13.2811 4.56256 13.5846 4.56659 13.886 4.56256C13.8902 4.56256 13.8944 4.56256 13.8986 4.56256C14.3507 4.56256 14.7359 4.1936 14.7359 3.7561C14.7359 3.36094 14.7359 2.96376 14.7359 2.56859C14.7359 2.39924 14.7359 2.2319 14.7359 2.06254C14.7338 1.55246 14.5433 1.10084 14.2126 0.707697C13.8253 0.252049 13.2058 0.0060803 12.6071 3.18822e-05C12.1696 -0.0040004 11.7489 0.375034 11.7698 0.806488C11.7908 1.24802 12.1382 1.60891 12.6071 1.61294C12.6657 1.61294 12.7222 1.61698 12.7787 1.62302C12.7055 1.61294 12.6301 1.60286 12.5569 1.5948C12.6678 1.61093 12.7746 1.63714 12.8792 1.67948C12.8122 1.65327 12.7453 1.62504 12.6783 1.59883C12.7787 1.64117 12.8729 1.69359 12.9609 1.75609C12.9043 1.71375 12.8478 1.67141 12.7913 1.62907C12.8855 1.69964 12.9671 1.77827 13.0404 1.86899C12.9964 1.81456 12.9525 1.76012 12.9085 1.70569C12.9734 1.79036 13.0278 1.88109 13.0718 1.97787C13.0446 1.91335 13.0153 1.84883 12.9881 1.78432C13.0299 1.88512 13.0592 1.98795 13.076 2.0948C13.0655 2.02424 13.055 1.95166 13.0467 1.88109C13.0739 2.10287 13.0571 2.33472 13.0571 2.5565C13.0571 2.87706 13.0571 3.19965 13.0571 3.52021C13.0571 3.59884 13.0571 3.67546 13.0571 3.75409C13.3355 3.48594 13.616 3.21578 13.8944 2.94763C13.6474 2.94763 13.4004 2.94763 13.1534 2.94763C12.559 2.94763 11.9666 2.94763 11.3721 2.94763C10.65 2.94763 9.92782 2.94763 9.20567 2.94763C8.58399 2.94763 7.96441 2.94763 7.34273 2.94763C7.04131 2.94763 6.7378 2.94158 6.43638 2.94763C6.43219 2.94763 6.428 2.94763 6.42382 2.94763C6.70221 3.21578 6.9827 3.48594 7.26109 3.75409C7.26109 3.23594 7.26109 2.71981 7.26109 2.20166C7.26109 2.0948 7.259 1.98795 7.27156 1.88109C7.26109 1.95166 7.25063 2.02424 7.24226 2.0948C7.259 1.98795 7.28621 1.88512 7.33017 1.78432C7.30296 1.84883 7.27365 1.91335 7.24644 1.97787C7.2904 1.88109 7.34482 1.79036 7.40971 1.70569C7.36575 1.76012 7.3218 1.81456 7.27784 1.86899C7.3511 1.77827 7.43274 1.69964 7.52693 1.62907C7.47041 1.67141 7.4139 1.71375 7.35738 1.75609C7.44529 1.69359 7.53949 1.64117 7.63996 1.59883C7.57298 1.62504 7.506 1.65327 7.43901 1.67948C7.54367 1.63915 7.65043 1.61093 7.76137 1.5948C7.6881 1.60488 7.61275 1.61496 7.53949 1.62302C7.73625 1.59883 7.94138 1.61294 8.14023 1.61294C8.52538 1.61294 8.91053 1.61294 9.29568 1.61294C10.1895 1.61294 11.0833 1.61294 11.9791 1.61294C12.1864 1.61294 12.3957 1.61294 12.6029 1.61294C13.0404 1.61294 13.4611 1.24197 13.4402 0.806488C13.4234 0.368986 13.076 3.18822e-05 12.6071 3.18822e-05Z"
                    fill="#E62614"
                  />
                  <path
                    d="M19.4842 2.94737C19.3188 2.94737 19.1513 2.94737 18.986 2.94737C18.5339 2.94737 18.0817 2.94737 17.6296 2.94737C16.9619 2.94737 16.292 2.94737 15.6243 2.94737C14.808 2.94737 13.9916 2.94737 13.1774 2.94737C12.2836 2.94737 11.3898 2.94737 10.496 2.94737C9.59384 2.94737 8.69168 2.94737 7.78951 2.94737C6.94805 2.94737 6.10659 2.94737 5.26512 2.94737C4.55344 2.94737 3.84175 2.94737 3.13216 2.94737C2.61933 2.94737 2.1065 2.94737 1.59367 2.94737C1.35295 2.94737 1.11223 2.94535 0.869424 2.94737C0.858958 2.94737 0.848492 2.94737 0.838026 2.94737C0.400549 2.94737 -0.0201821 3.31834 0.000749778 3.75382C0.0216817 4.19133 0.369151 4.56028 0.838026 4.56028C1.00339 4.56028 1.17084 4.56028 1.33621 4.56028C1.78833 4.56028 2.24046 4.56028 2.69259 4.56028C3.36032 4.56028 4.03014 4.56028 4.69787 4.56028C5.51421 4.56028 6.33056 4.56028 7.14481 4.56028C8.0386 4.56028 8.93239 4.56028 9.82619 4.56028C10.7284 4.56028 11.6305 4.56028 12.5327 4.56028C13.3741 4.56028 14.2156 4.56028 15.0571 4.56028C15.7688 4.56028 16.4804 4.56028 17.19 4.56028C17.7029 4.56028 18.2157 4.56028 18.7285 4.56028C18.9692 4.56028 19.21 4.5623 19.4528 4.56028C19.4632 4.56028 19.4737 4.56028 19.4842 4.56028C19.9216 4.56028 20.3424 4.18931 20.3214 3.75382C20.3005 3.31632 19.953 2.94737 19.4842 2.94737Z"
                    fill="#E62614"
                  />
                  <path
                    d="M8.32449 15.5651C8.32449 15.2929 8.32449 15.0207 8.32449 14.7506C8.32449 14.0973 8.32449 13.4461 8.32449 12.7929C8.32449 12.0066 8.32449 11.2223 8.32449 10.436C8.32449 9.75457 8.32449 9.0711 8.32449 8.38965C8.32449 8.059 8.33077 7.72835 8.32449 7.39771C8.32449 7.39367 8.32449 7.38763 8.32449 7.38359C8.32449 6.96222 7.93964 6.55698 7.48786 6.57714C7.03399 6.5973 6.65123 6.93198 6.65123 7.38359C6.65123 7.65577 6.65123 7.92795 6.65123 8.19812C6.65123 8.85134 6.65123 9.50256 6.65123 10.1558C6.65123 10.9421 6.65123 11.7264 6.65123 12.5127C6.65123 13.1941 6.65123 13.8776 6.65123 14.559C6.65123 14.8897 6.64495 15.2203 6.65123 15.551C6.65123 15.555 6.65123 15.5611 6.65123 15.5651C6.65123 15.9865 7.03608 16.3917 7.48786 16.3715C7.93964 16.3534 8.32449 16.0187 8.32449 15.5651Z"
                    fill="#E62614"
                  />
                  <path
                    d="M13.666 15.5651C13.666 15.2929 13.666 15.0207 13.666 14.7506C13.666 14.0973 13.666 13.4461 13.666 12.7929C13.666 12.0066 13.666 11.2223 13.666 10.436C13.666 9.75457 13.666 9.0711 13.666 8.38965C13.666 8.059 13.6723 7.72835 13.666 7.39771C13.666 7.39367 13.666 7.38763 13.666 7.38359C13.666 6.96222 13.2812 6.55698 12.8294 6.57714C12.3755 6.5973 11.9928 6.93198 11.9928 7.38359C11.9928 7.65577 11.9928 7.92795 11.9928 8.19812C11.9928 8.85134 11.9928 9.50256 11.9928 10.1558C11.9928 10.9421 11.9928 11.7264 11.9928 12.5127C11.9928 13.1941 11.9928 13.8776 11.9928 14.559C11.9928 14.8897 11.9865 15.2203 11.9928 15.551C11.9928 15.555 11.9928 15.5611 11.9928 15.5651C11.9928 15.9865 12.3776 16.3917 12.8294 16.3715C13.2833 16.3534 13.666 16.0187 13.666 15.5651Z"
                    fill="#E62614"
                  />
                </svg>
                <span className="groupButton__delete--text">Xoá lịch</span>
              </div>
              <button className="groupButton__save" type="submit">
                Lưu
              </button>
              <button
                className="groupButton__cancel"
                type="button"
                onClick={handleClickCancel}
              >
                Huỷ
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
