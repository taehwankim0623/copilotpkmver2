import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, CheckCircle, Bone, Brain, Layers, PersonStanding, MoreHorizontal, Utensils, Wind, AlertTriangle } from 'lucide-react';

// =================================================================
// 0. 타입 정의
// =================================================================
type ChartMode = 
  'growth_growth' | 'growth_precocious_puberty' | 'growth_underweight' | 'growth_obesity' |
  'digestive_appetite' | 'digestive_indigestion' | 'digestive_nausea' | 'digestive_ibs' | 'digestive_constipation' |
  'respiratory_rhinitis' | 'respiratory_frequent_colds' | 'respiratory_cough' | 'respiratory_epistaxis' | 'respiratory_asthma' |
  'nervous_headache' | 'nervous_dizziness' | 'nervous_tic' | 'nervous_adhd' | 'nervous_syncope' | 'nervous_student_care' | 'nervous_enuresis' | 'nervous_convulsion' | 'nervous_night_crying' |
  'skin_head_sweating' | 'skin_hand_foot_sweating' | 'skin_atopy' | 'skin_urticaria' | 'skin_dermatitis' |
  'development_language_delay' | 'development_asd' |
  'etc_menstrual_disorders' | 'etc_cold_hands_feet' | 'etc_oral_symptoms';

interface BaseFormData { [key: string]: any; }

// =================================================================
// 양식 설정
// =================================================================
const formConfig: { [key in ChartMode]: any } = {
    growth_growth: {
        title: '#성장',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'combined_text', label: '최근 1년 키 성장', nameNum: 'growthLastYearNum', nameText: 'growthLastYearText', unit: 'cm/yr', placeholderNum: 'Ref: 5-6', placeholderText: '서술형' },
                { type: 'text', label: '성장 관련 진료', name: 'growthHistory', placeholder: '예: 성장클리닉 진료 경험 있음' }
            ]},
            { type: 'symptoms_grid', title: '♀️♂️ 2차 성징', name: 'pubertySigns', symptoms: [
                { key: 'thelarche', label: '가슴멍울', textPlaceholder: 'Ref: 10세 (8세 전 r/o성조숙증)' }, 
                { key: 'pubarche', label: '음모' },
                { key: 'menarche', label: '초경', textPlaceholder: 'Ref: 11.5-12세' }, 
                { key: 'testicularDevelopment', label: '고환', textPlaceholder: 'Ref: 9세 이전 4cc r/o 성조숙증' }
            ]},
            { 
                type: 'horizontal_group', 
                title: '👨‍👩‍👧‍👦 부모 성장 패턴', 
                chartFormat: 'single_line_parent_growth',
                fields: [
                    { type: 'text', label: '부 (Father)', name: 'fatherGrowthPattern', placeholder: '예: 고1때 10cm 큼' },
                    { type: 'text', label: '모 (Mother)', name: 'motherGrowthPattern', placeholder: '예: 초6때 초경, 이후 거의 안 큼' }
                ]
            },
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    growth_precocious_puberty: { title: '#성조숙증', fields: [] },
    growth_underweight: {
        title: '#저체중',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터 저체중이었는지' },
                { type: 'text', label: '최근 1년 체중 증가', name: 'weightGainLastYear', placeholder: '예: 1kg' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '식습관', name: 'eatingHabits', placeholder: '예: 소식, 편식' },
                    { type: 'text', label: '운동량', name: 'activityLevel', placeholder: '예: 주 3회 축구' }
                ]},
                { type: 'text', label: '부모 체형', name: 'parentBodyType', placeholder: '예: 부(마름), 모(보통)' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    growth_obesity: {
        title: '#비만',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'BMI 백분위수', name: 'bmiPercentile', placeholder: '예: 95%' },
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터 비만이었는지' },
                 { type: 'horizontal_group', fields: [
                    { type: 'text', label: '식습관', name: 'eatingHabits', placeholder: '예: 야식, 과자 즐겨먹음' },
                    { type: 'text', label: '운동량', name: 'activityLevel', placeholder: '예: 거의 없음' }
                ]},
                { type: 'text', label: '부모 체형', name: 'parentBodyType', placeholder: '예: 부(비만), 모(과체중)' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    digestive_appetite: {
        title: '#식욕부진',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: '식사량', name: 'mealAmount', placeholder: '예: 평소의 절반 정도' },
                { type: 'text', label: '식습관', name: 'eatingHabits', placeholder: '예: 불규칙한 식사, 식사시간이 김' },
                { type: 'radio_with_text', label: '배고픔 호소', name: 'hungerComplaint', nameText: 'customHunger', options: ['없음', '거의 없음', '있음'] },
                { type: 'select_with_text', label: '원인', name: 'cause', nameText: 'causeText', options: ['선택하세요', '음식에 관심 부족', '복부 불편감', '편식', '기분에 따라 편차 큼', '특정 사건 후 거부', '기타'] }
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'accompanyingSymptoms', symptoms: [
                { key: 'abdominalPain', label: '복통' }, { key: 'defecationDuringMeal', label: '식사중배변' }, { key: 'burping', label: '트림' }, 
                { key: 'indigestion', label: '식체' }, { key: 'bowelSounds', label: '장명' }, { key: 'nausea', label: '오심' },
                { key: 'pickyEating', label: '편식' }, { key: 'newFoodAversion', label: '새로운 음식 불호' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    digestive_indigestion: {
        title: '#소화불량',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: '부위', name: 'area', placeholder: '예: 명치, 배꼽 주변' },
                { type: 'text', label: '양상', name: 'pattern', placeholder: '예: 콕콕, 답답, 쓰림, 쥐어짜듯' },
                { type: 'text', label: '지속시간', name: 'duration', placeholder: '예: 식후 30분' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '완화', name: 'relief_factors', placeholder: '예: 눕거나, 따뜻하게 하면' },
                    { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 기름진 음식 섭취 시' },
                ]},
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'accompanyingSymptoms', symptoms: [
                { key: 'abdominalPain', label: '복통' }, { key: 'defecationDuringMeal', label: '식사중배변' }, { key: 'burping', label: '트림' }, 
                { key: 'indigestion', label: '식체' }, { key: 'bowelSounds', label: '장명' }, { key: 'nausea', label: '오심' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    digestive_nausea: {
        title: '#오심/구역',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '빈도', name: 'frequency', placeholder: '예: 주 2-3회' },
                    { type: 'text', label: '요인', name: 'factors', placeholder: '예: 차멀미, 특정 냄새' },
                ]},
                { type: 'text', label: '구토 양상', name: 'vomit_pattern', placeholder: '예: 소화 안된 음식물, 위액' },
                { type: 'text', label: '병원력', name: 'medical_history', placeholder: '예: 위장염' },
                { type: 'text', label: '구토 이후 GI Sx.', name: 'post_vomit_sx', placeholder: '예: 복통 완화' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'accompanyingSymptoms', symptoms: [
                { key: 'vomiting', label: '구토' }, { key: 'nausea', label: '오심' }, { key: 'headache', label: '두통' }, 
                { key: 'dizziness', label: '어지럼증' }, { key: 'neuro_sx', label: 'Neurologic Sx' }, { key: 'fever_chills', label: '발열오한' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    digestive_ibs: {
        title: '#IBS',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'text', label: '요인', name: 'factors', placeholder: '예: 스트레스, 긴장 시' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '배변빈도', name: 'defecation_freq', placeholder: '예: 하루 3-4회' },
                    { type: 'text', label: '배변양상', name: 'defecation_pattern', placeholder: '예: 무른 변, 설사' },
                ]},
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'accompanyingSymptoms', symptoms: [
                { key: 'abdominalPain', label: '복통' }, { key: 'tenesmus', label: '급박변' }, { key: 'gas', label: '방귀' }, 
                { key: 'incomplete_evacuation', label: '후중감' }, { key: 'nocturnal_pain', label: '야간복통' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    digestive_constipation: {
        title: '#변비',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: '배변빈도', name: 'defecation_freq', placeholder: '예: 3일에 1번' },
                { type: 'text', label: '배변양상', name: 'defecation_pattern', placeholder: '예: 토끼똥, 단단하고 굵음' },
                { type: 'text', label: '배변시간', name: 'defecation_time', placeholder: '예: 10분 이상' },
                { type: 'text', label: '음수량/섬유질 섭취', name: 'intake', placeholder: '예: 물 거의 안 마심, 채소 안 먹음' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'accompanyingSymptoms', symptoms: [
                { key: 'dyschezia', label: '배변난' }, { key: 'anal_fissure', label: '항문열상' }, { key: 'urge', label: '변의' }, 
                { key: 'withholding', label: '배변회피' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    respiratory_rhinitis: {
        title: '#비염',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, agg', name: 'os_agg', placeholder: '예: 1년 전부터 환절기 심화' },
            ]},
            { type: 'symptoms_grid_three_options', title: '🤧 주증상', chartFormat: 'rhinitis_main', symptoms: [
                { key: 'nasalCongestion', label: '코막힘' }, { key: 'rhinorrhea', label: '콧물' },
                { key: 'sneezing', label: '재채기' }, { key: 'itching', label: '소양감' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'postNasalDrip', label: '후비루' }, { key: 'epistaxis', label: '코피' },
                { key: 'mouthBreathing', label: '구강호흡' }, { key: 'snoring', label: '코골이' },
                { key: 'tossingAndTurning', label: '뒤척임' }, { key: 'bruxism', label: '이갈이' },
            ]},
            { type: 'group', title: '🩺 소견', fields: [
                { type: 'text', label: '비강/구인두 소견', name: 'findings', placeholder: '예: pale turbinate, cobble stone throat' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    respiratory_frequent_colds: {
        title: '#잦은 감기',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: '감기 빈도', name: 'cold_freq', placeholder: '예: 한달에 1-2번' },
                { type: 'text', label: '감기 지속기간', name: 'cold_duration', placeholder: '예: 1-2주' },
                { type: 'text', label: '감기 패턴', name: 'cold_pattern', placeholder: '예: 주로 목감기, 열감기' },
                { type: 'text', label: '단체생활', name: 'group_life', placeholder: '예: 어린이집 다님' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'dryness', label: '건조' }, { key: 'appetite_loss', label: '식욕부진' },
                { key: 'sweating', label: '다한' }, { key: 'allergy', label: '알러지' },
            ]},
            { type: 'group', title: '🩺 소견', fields: [
                 { type: 'text', label: '청진 소견', name: 'auscultation_findings', placeholder: '예: Crackle, Wheezing, Stridor...' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    respiratory_cough: {
        title: '#기침',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'radio_with_text', label: '양상', name: 'cough_pattern_radio', nameText: 'cough_pattern_text', options: ['켁켁', '콜록콜록', '쿨럭쿨럭', '컹컹'] },
                { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 밤에, 찬바람 쐬면' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'nasal_sx', label: '코Sx.' }, { key: 'throat_sx', label: '인후Sx' },
                { key: 'chest_sx', label: '흉부Sx' }, { key: 'nocturnal_cough', label: '야간기침' },
                { key: 'focus_cough', label: '집중시기침' },
            ]},
            { type: 'group', title: '🩺 소견', fields: [
                 { type: 'text', label: '청진 소견', name: 'auscultation_findings', placeholder: '예: Crackle, Wheezing, Stridor...' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    respiratory_epistaxis: {
        title: '#코피',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: '빈도, 양상', name: 'freq_pattern', placeholder: '주 1-2회, 자다가도 난다.' },
                { type: 'text', label: 'AggF', name: 'agg_factors', placeholder: '예: 환절기, 건조할 때' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'rhinitis', label: '비염' }, { key: 'itching', label: '소양감' },
                { key: 'nose_picking', label: '코후비기' }, { key: 'stinging', label: '따끔하다' },
            ]},
             { type: 'group', title: '🩺 소견', fields: [
                { type: 'text', label: '비강/구인두 소견', name: 'nasal_findings', placeholder: '' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    respiratory_asthma: {
        title: '#천식',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, PH', name: 'os_ph', placeholder: '예: 2년 전 진단' },
                { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 운동 후, 감기 걸리면' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '정도', name: 'severity', placeholder: '예: 흡입기 휴대 중' },
                    { type: 'text', label: 'med', name: 'medication', placeholder: '예: 싱귤레어' },
                ]},
            ]},
            { type: 'symptoms_grid', title: '😮 증상', symptoms: [
                { key: 'cough', label: '기침' }, { key: 'dyspnea', label: '호흡곤란' },
                { key: 'wheezing', label: '천명음' }, { key: 'chest_tightness', label: '흉민' },
            ]},
            { type: 'group', title: '🩺 소견', fields: [
                 { type: 'text', label: '청진 소견', name: 'auscultation_findings', placeholder: '예: Crackle, Wheezing, Stridor...' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_headache: {
        title: '#두통',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '부위', name: 'location', placeholder: '예: 관자놀이, 뒷머리' },
                    { type: 'text', label: '양상', name: 'pattern', placeholder: '예: 욱신거림, 조이는 느낌' }
                ]},
                { type: 'text', label: '지속시간', name: 'duration', placeholder: '예: 1-2시간' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '완화', name: 'relief_factors', placeholder: '예: 자고 나면' },
                    { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 스트레스 시' }
                ]},
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'dizziness', label: '어지럼증' }, { key: 'nausea_vomiting', label: '오심구토' }, { key: 'neuro_sx', label: 'Neurologic Sx' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_dizziness: {
        title: '#어지럼증',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'radio_with_text', label: '양상', name: 'dizziness_pattern_radio', nameText: 'dizziness_pattern_text', options: ["빙빙 돈다", "핑 돈다. 눈앞이 깜깜하다", "균형을 못 잡는다", "몽롱하다. 꿈 꾸는 것 같다"] },
                { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 일어설 때' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'headache', label: '두통' }, { key: 'nausea_vomiting', label: '오심구토' },
                { key: 'neuro_sx', label: 'Neurologic Sx' }, { key: 'ear_sx', label: '귀 Sx' }, { key: 'np_med', label: 'NP med' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_tic: {
        title: '#TIC',
        warning: '아이와 따로 상담하시길 권해드립니다.',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '음성틱', name: 'vocal_tic', placeholder: '예: 킁킁, 흠흠' },
                    { type: 'text', label: '운동틱', name: 'motor_tic', placeholder: '예: 눈 깜빡임, 어깨 으쓱' }
                ]},
                { type: 'text', label: 'AggF', name: 'agg_factors', placeholder: '예: 긴장, 흥분 시' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '정도', name: 'severity', placeholder: '예: 학교 선생님도 인지' },
                    { type: 'text', label: '아이 본인 인지', name: 'awareness', placeholder: '예: 알고 있음' }
                ]},
                { type: 'text', label: '예민도', name: 'sensitivity', placeholder: '예: 예민한 성향' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_adhd: {
        title: '#ADHD',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, PH', name: 'os_ph', placeholder: '진단 시기, 과거력' },
                { type: 'text', label: '양상', name: 'pattern', placeholder: '예: 부주의 우세형' },
                { type: 'text', label: '정도', name: 'severity', placeholder: '예: 학교에서 지적 받을 정도' },
                { type: 'text', label: 'med', name: 'medication', placeholder: '예: 콘서타 복용 중' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_syncope: {
        title: '#Syncope',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, PH', name: 'os_ph', placeholder: '언제부터, 과거력' },
                { type: 'text', label: '요인', name: 'factors', placeholder: '예: 오래 서 있을 때' },
                { type: 'text', label: '실신 양상', name: 'syncope_pattern', placeholder: '예: 의식 잃고 쓰러짐' },
                { type: 'text', label: '과거력/가족력', name: 'history', placeholder: '예: 없음' },
            ]},
            { type: 'symptoms_grid', title: '🤢 전조 증상', symptoms: [
                { key: 'eye_sx', label: '눈증상' }, { key: 'nausea', label: '오심' },
                { key: 'sweating', label: '자한' }, { key: 'chest_sx', label: '흉부Sx' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_student_care: {
        title: '#수험생 원보',
        fields: [
            { type: 'group', title: '🧠 기본 정보', fields: [
                { type: 'radio_with_text', label: '집중력', name: 'concentration_radio', nameText: 'concentration_text', options: ["자꾸 딴 생각이 나요", "멍해져요", "졸려요", "집중력은 좋은데 체력이 부족해요"] },
                { type: 'text', label: '시험기간 증상', name: 'exam_sx', placeholder: '예: 소화불량, 두통' },
                { type: 'text', label: '긴장/심리', name: 'anxiety', placeholder: '예: 시험 불안 심함' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_enuresis: {
        title: '#야뇨증',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'select_with_text', label: 'o/s', name: 'os_type', nameText: 'os_type_text', options: ['선택하세요', '1차성', '2차성'], alwaysShowText: true },
                { type: 'text', label: '야뇨 빈도 / 야뇨량 / 야뇨 시간', name: 'enuresis_details', placeholder: '예: 주 2-3회 / 팬티 다 젖을 정도 / 새벽 2-3시' },
                { type: 'text', label: '수면 습관', name: 'sleep_habit', placeholder: '예: 깊게 잠' },
                { type: 'text', label: '주간 배뇨 습관', name: 'daytime_urination', placeholder: '예: 소변 자주 참음' },
                { type: 'text', label: 'AggF', name: 'agg_factors', placeholder: '예: 피곤할 때' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'constipation', label: '변비' }, { key: 'pollakiuria', label: '빈뇨' },
                { key: 'urgency', label: '요절박' }, { key: 'dysuria', label: '배뇨통' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_convulsion: {
        title: '#경련',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'Seizure Attack o/s, PH', name: 'os_ph', placeholder: '최초 발작, 과거력' },
                { type: 'text', label: '요인', name: 'factors', placeholder: '예: 고열, 수면 부족' },
                { type: 'text', label: 'med', name: 'medication', placeholder: '예: 항경련제 복용 중' },
                { type: 'text', label: 'Traumatic Hx./Family Hx./발달지연', name: 'history_dev', placeholder: '' },
            ]},
            { type: 'green_group', title: '⚡ Seizure 양상', chartFormat: 'seizure_details', fields: [
                { type: 'text', label: 'Seizure Type', name: 'seizure_type', placeholder: '예: 전신성/국소성, 양측성/편측성' },
                { type: 'text', label: 'Duration', name: 'duration', placeholder: '예: 1-2분' },
                { type: 'symptoms_grid', title: '🤢 동반 증상', name: 'convulsion_symptoms', symptoms: [
                    { key: 'fever', label: '발열' }, { key: 'eyeball_deviation', label: 'Eyeball Deviation' },
                    { key: 'loc', label: '의식소실' }, { key: 'postictal_sleep', label: 'Postictal sleep' },
                    { key: 'drooling', label: '침흘림' }, { key: 'urination', label: 'Urination' },
                    { key: 'defecation', label: 'Defication' }, { key: 'vomiting', label: 'Vomiting' }, { key: 'cyanosis', label: 'Cyanosis' },
                ]},
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    nervous_night_crying: {
        title: '#야제',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s', name: 'os', placeholder: '언제부터' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '빈도', name: 'frequency', placeholder: '예: 매일 밤' },
                    { type: 'text', label: '양상', name: 'pattern', placeholder: '예: 입면난/빈각/천면/다몽' },
                ]},
                { type: 'text', label: '단체생활/Trauma', name: 'trauma', placeholder: '예: 어린이집 적응 중' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'sensitivity', label: '예민' }, { key: 'heat_cold', label: '한열' },
                { key: 'respiratory', label: '호흡기' }, { key: 'digestive', label: '소화기' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    skin_head_sweating: {
        title: '#두한',
        fields: [
            { type: 'group', title: '💧 기본 정보', fields: [
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '부위', name: 'location', placeholder: '예: 머리, 등' },
                    { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 잘 때, 밥 먹을 때' },
                ]},
                { type: 'text', label: '다한출 이후 반응', name: 'post_sweating_reaction', placeholder: '예: 힘들어함, 감기에 잘 걸림' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    skin_hand_foot_sweating: {
        title: '#수족다한',
        fields: [
            { type: 'group', title: '💧 기본 정보', fields: [
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '부위', name: 'location', placeholder: '예: 손, 발' },
                    { type: 'text', label: '정도', name: 'severity', placeholder: 'Gr. ' }
                ]},
                { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 긴장 시' },
            ]},
            { type: 'info_box', title: 'ℹ️ Grade 참고', lines: [
                'Gr0. 땀이 없다 (absent)',
                'Gr1. 손발바닥이 촉촉하다 (mild)',
                'Gr2. 눈에 보일 정도이지만 흐르지 않는다 (Moderate)',
                'Gr3. 눈에 보일 정도이며 흐른다 (Severe)',
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'rash', label: '발진' }, { key: 'stinging', label: '따가움' },
                { key: 'heat_sensation', label: '열감' }, { key: 'cold_hands_feet', label: '수족냉' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    skin_atopy: {
        title: '#아토피',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, AggF', name: 'os_agg', placeholder: '언제부터, 악화 요인' },
                { type: 'text', label: '부위', name: 'location', placeholder: '예: 팔 접히는 곳' },
                { type: 'text', label: '소양감/수면방해', name: 'itching_sleep', placeholder: '예: 야간에 악화. 수면에 방해 될 정도' },
                { type: 'text', label: 'med', name: 'medication', placeholder: '예: 스테로이드 연고' },
                { type: 'text', label: '알러지, 감염 과거력/가족력', name: 'history', placeholder: '예: 부(비염), 모(천식)' },
            ]},
            { type: 'symptoms_grid', title: '🔴 피부 양상', symptoms: [
                { key: 'erythema', label: '홍반' }, { key: 'excoriation', label: '찰상' },
                { key: 'papule', label: '구진' }, { key: 'crust', label: '가피(진물)' },
                { key: 'dryness', label: '건조(인설)' }, { key: 'lichenification', label: '태선화' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    skin_urticaria: {
        title: '#두드러기',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, AggF', name: 'os_agg', placeholder: '언제부터, 악화 요인' },
                { type: 'text', label: '빈도 / 지속 시간', name: 'freq_duration', placeholder: '예: 주 1회 / 2-3시간' },
                { type: 'text', label: '요인', name: 'factors', placeholder: '예: 특정 음식 섭취 후' },
                { type: 'text', label: '알러지 과거력/가족력', name: 'allergy_history', placeholder: '예: 없음' },
            ]},
            { type: 'symptoms_grid', title: '🔴 피부 양상', symptoms: [
                { key: 'wheal', label: '팽진' }, { key: 'itching', label: '소양감' },
                { key: 'pain', label: '자통' }, { key: 'burning_sensation', label: '작열감' }, { key: 'angioedema', label: '혈관부종' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    skin_dermatitis: {
        title: '#피부염',
        fields: [
            { type: 'group', title: '📊 기본 정보', fields: [
                { type: 'text', label: 'o/s, AggF', name: 'os_agg', placeholder: '언제부터, 악화 요인' },
                { type: 'text', label: '부위', name: 'location', placeholder: '예: 얼굴, 목' },
                { type: 'text', label: '소양감/수면방해', name: 'itching_sleep', placeholder: '예: 야간에 악화. 수면에 방해 될 정도' },
                { type: 'text', label: 'med', name: 'medication', placeholder: '예: 보습제 사용' },
                { type: 'text', label: '알러지,감염 과거력/가족력', name: 'history', placeholder: '예: 없음' },
            ]},
            { type: 'symptoms_grid', title: '🔴 피부 양상', symptoms: [
                { key: 'erythema', label: '홍반' }, { key: 'excoriation', label: '찰상' },
                { key: 'papule', label: '구진' }, { key: 'crust', label: '가피(진물)' },
                { key: 'dryness', label: '건조(인설)' }, { key: 'lichenification', label: '태선화' },
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    development_language_delay: {
        title: '#언어/발달지연',
        fields: [
            { type: 'group', title: '🗣️ 기본 정보', fields: [
                { type: 'text', label: '첫 발화', name: 'first_word', placeholder: '예: 18개월' },
                { type: 'text', label: 'PH', name: 'ph', placeholder: '과거력' },
                { type: 'text', label: '낱말 조합', name: 'word_combination', placeholder: '예: 24개월' },
                { type: 'text', label: '조음', name: 'articulation', placeholder: '예: 부정확' },
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'interaction', label: '상호작용불가' }, { key: 'eye_contact', label: '눈맞춤불가' }, { key: 'stereotypy', label: '상동행동' }
            ]},
            { type: 'pronunciation_sample', title: '👄 발음 Sample', words: ['자동차', '사탕', '꼬리', '전화기', '괴물', '싸움'] },
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    development_asd: {
        title: '#ASD',
        fields: [
            { type: 'group', title: '🤔 기본 정보', fields: [
                { type: 'text', label: '의사소통', name: 'communication', placeholder: '예: 호명반응 없음' },
                { type: 'text', label: '사회성', name: 'sociality', placeholder: '예: 친구에게 관심 없음' },
                { type: 'text', label: '상동행동', name: 'stereotypy', placeholder: '예: 손 흔들기' },
                { type: 'text', label: '병원력', name: 'medical_history', placeholder: '예: OO병원에서 ASD 의심 진단' },
                { type: 'text', label: '치료', name: 'treatment', placeholder: '예: 감각통합치료 중' },
            ]},
             { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'small_stature', label: '왜소' }, { key: 'appetite_loss', label: '식욕부진' }, { key: 'hyperactivity', label: '과잉행동' },
                { key: 'anger', label: '분노성향' }, { key: 'unclear_speech', label: '언어불명료' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    etc_menstrual_disorders: {
        title: '#월경부조',
        fields: [
            { type: 'group', title: '🩸 기본 정보', fields: [
                { type: 'text', label: '초경', name: 'menarche', placeholder: '예: 13세' },
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '주기', name: 'cycle', placeholder: 'Ref: 21-35일' },
                    { type: 'text', label: '기간', name: 'duration', placeholder: 'Ref: 2-7일' },
                ]},
                { type: 'text', label: '생리혈 양 / 양상', name: 'flow_pattern', placeholder: '예: 양 적고, 덩어리짐' },
                { type: 'text', label: '생리통 양상', name: 'dysmenorrhea_pattern', placeholder: '예: 찌르듯, 은은, 묵직 / 진통제 복용 시 호전 여부' },
            ]},
            { 
                type: 'symptoms_grid', 
                title: 'PMS', 
                symptoms: [
                    { key: 'dizziness_palpitation', label: '현훈경계' }, { key: 'breast_distention', label: '유방팽창' }, { key: 'nausea_vomiting', label: '오심구토' },
                    { key: 'cold_abdomen', label: '하복냉' }, { key: 'low_back_pain', label: '요통' },
                ],
                customField: { type: 'text', name: 'pms_details', placeholder: '기타 증상...' }
            },
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    etc_cold_hands_feet: {
        title: '#수족냉',
        fields: [
            { type: 'group', title: '🥶 기본 정보', fields: [
                { type: 'horizontal_group', fields: [
                    { type: 'text', label: '양상', name: 'pattern', placeholder: '예: 손끝만 차가움' },
                    { type: 'text', label: '악화', name: 'agg_factors', placeholder: '예: 겨울, 긴장 시' },
                ]},
            ]},
            { type: 'symptoms_grid', title: '🤢 동반 증상', symptoms: [
                { key: 'hyperhidrosis', label: '수족다한' }, { key: 'numbness', label: '저림' }, { key: 'raynaud', label: '레이노' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
    etc_oral_symptoms: {
        title: '#구설',
        fields: [
            { type: 'group', title: '👄 기본 정보', fields: [
                { type: 'text', label: '구창', name: 'stomatitis', placeholder: '예: 혓바늘, 구내염' },
                { type: 'text', label: '구취', name: 'halitosis', placeholder: '예: 아침에 심함' },
                { type: 'text', label: '미각', name: 'taste', placeholder: '예: 쓴맛' },
                { type: 'text', label: '입술 증상', name: 'lip_symptoms', placeholder: '예: 건조, 각질' },
            ]},
            { type: 'symptoms_grid', title: '', chartPrefix: '+ ', symptoms: [
                { key: 'stress', label: '스트레스' }, { key: 'saliva', label: '침 분비' }, { key: 'dental_issue', label: '치과질환' }
            ]},
            { type: 'textarea', name: 'other', title: '📝 기타' }
        ]
    },
};
formConfig.growth_precocious_puberty.fields = formConfig.growth_growth.fields;

const createInitialState = (fields: any[]) => {
    const state: BaseFormData = {};
    fields.forEach(field => {
        if (field.type === 'group' || field.type === 'horizontal_group' || field.type === 'green_group') {
            Object.assign(state, createInitialState(field.fields));
        } else if (field.type === 'symptoms_grid' || field.type === 'symptoms_grid_three_options') {
            field.symptoms?.forEach((symptom: any) => {
                state[symptom.key] = '';
                state[`${symptom.key}Text`] = '';
            });
            if(field.customField) {
                state[field.customField.name] = '';
            }
        } else if (field.type === 'pronunciation_sample') {
            field.words?.forEach((word: string) => {
                state[`pronunciation_${word}`] = '';
            });
        } else if (field.name) {
            state[field.name] = '';
            if (field.nameText) {
                state[field.nameText] = '';
            }
        }
    });
    return state;
};

const initialFormData: { [key in ChartMode]?: BaseFormData } = {};
Object.keys(formConfig).forEach(key => {
    if (formConfig[key as ChartMode].fields) {
        initialFormData[key as ChartMode] = createInitialState(formConfig[key as ChartMode].fields);
    }
});

// =================================================================
// 차트 텍스트 생성 헬퍼 함수
// =================================================================
const generateChartText = (formData: BaseFormData, config: any, summary?: string) => {
    if (!formData || !config || !config.fields) return '';

    const lines: string[] = [];
    const processField = (field: any) => {
        const cleanLabel = (field.label || field.title || '').replace(/[^\uAC00-\uD7A3\w\s.,()/-]/g, '').trim();

        switch (field.type) {
            case 'text':
                if (formData[field.name]) lines.push(`-${cleanLabel} : ${formData[field.name]}`);
                break;
            case 'combined_text':
                let combinedValue = '';
                if (formData[field.nameNum]) combinedValue += `${formData[field.nameNum]}${field.unit || ''}`;
                if (formData[field.nameText]) combinedValue += (combinedValue ? `, ${formData[field.nameText]}` : formData[field.nameText]);
                if (combinedValue) lines.push(`-${cleanLabel} : ${combinedValue}`);
                break;
            case 'radio_with_text':
                let radioValue = '';
                if (formData[field.name]) radioValue += formData[field.name];
                if (formData[field.nameText]) radioValue += (radioValue ? `, ${formData[field.nameText]}` : formData[field.nameText]);
                if (radioValue) lines.push(`-${cleanLabel} : ${radioValue}`);
                break;
            case 'select':
                if (formData[field.name] && formData[field.name] !== field.options[0]) lines.push(`-${cleanLabel} : ${formData[field.name]}`);
                break;
            case 'select_with_text':
                let selectValue = '';
                if (formData[field.name] && formData[field.name] !== field.options[0]) {
                    selectValue = formData[field.name];
                    if (formData[field.nameText]) {
                        selectValue += `(${formData[field.nameText]})`;
                    }
                } else if (!formData[field.name] && formData[field.nameText]) {
                    selectValue = formData[field.nameText];
                }
                if (selectValue) lines.push(`-${cleanLabel} : ${selectValue}`);
                break;
            case 'symptoms_grid': {
                const selectedSymptoms = field.symptoms
                    .map((symptom: any) => {
                        const status = formData[symptom.key];
                        const textValue = formData[`${symptom.key}Text`];
                        if (status) return textValue ? `${symptom.label}(${status}, ${textValue})` : `${symptom.label}(${status})`;
                        return null;
                    }).filter(Boolean);
                
                let symptomLine = selectedSymptoms.join(' ');
                
                if (field.customField && formData[field.customField.name]) {
                    symptomLine += (symptomLine ? ' ' : '') + formData[field.customField.name];
                }

                if (symptomLine) {
                    const prefix = field.chartPrefix || `-${cleanLabel} : `;
                    lines.push(`${prefix}${symptomLine}`);
                }
                break;
            }
            case 'symptoms_grid_three_options': {
                const formatMainSymptom = (s: any) => {
                    const status = formData[s.key];
                    const textValue = formData[`${s.key}Text`];
                    if (!status) return null;
                    return textValue ? `${s.label}(${status}, ${textValue})` : `${s.label}(${status})`;
                };
                const severeSymptoms = field.symptoms.filter((s: any) => formData[s.key] === '++').map(formatMainSymptom).filter(Boolean);
                const otherSymptoms = field.symptoms.filter((s: any) => formData[s.key] && formData[s.key] !== '++').map(formatMainSymptom).filter(Boolean);
                let symptomLine = '';
                if (severeSymptoms.length > 0) {
                    symptomLine += severeSymptoms.join(' ');
                    if (otherSymptoms.length > 0) {
                        symptomLine += ' / ' + otherSymptoms.join(' ');
                    }
                } else if (otherSymptoms.length > 0) {
                    symptomLine += otherSymptoms.join(' ');
                }
                if(symptomLine) lines.push(`-${cleanLabel} : ${symptomLine}`);
                break;
            }
            case 'pronunciation_sample': {
                const samples = field.words
                    .map((word: string) => {
                        const pronunciation = formData[`pronunciation_${word}`];
                        return pronunciation ? `${word}(${pronunciation})` : null;
                    }).filter(Boolean);
                if (samples.length > 0) lines.push(`+ ${samples.join(' / ')}`);
                break;
            }
            case 'group':
            case 'horizontal_group':
            case 'green_group':
                if (field.chartFormat === 'single_line_parent_growth') {
                    const fatherValue = formData.fatherGrowthPattern;
                    const motherValue = formData.motherGrowthPattern;
                    let parentText = '';
                    if (fatherValue) parentText += `부(${fatherValue})`;
                    if (motherValue) parentText += (parentText ? ' ' : '') + `모(${motherValue})`;
                    if (parentText) lines.push(`-${cleanLabel} : ${parentText}`);
                } else if (field.chartFormat === 'seizure_details') {
                    const seizureFields = ['seizure_type', 'duration'];
                    const symptomKeys = field.fields.find((f:any) => f.name === 'convulsion_symptoms')?.symptoms.map((s:any) => s.key) || [];
            
                    const hasData = seizureFields.some(key => formData[key]) || symptomKeys.some((key:string) => formData[key]);
            
                    if (hasData) {
                        lines.push('\n*Seizure 양상');
                        field.fields.forEach(processField);
                    }
                }
                else {
                    field.fields.forEach(processField);
                }
                break;
            case 'full_textarea':
                if(field.fields) field.fields.forEach(processField);
                break;
        }
    };
    config.fields.forEach(processField);
    
    const otherField = config.fields.find((f: any) => f.type === 'textarea' && f.name === 'other');
    if (otherField && formData.other && formData.other.trim()) {
        lines.push(`+ ${formData.other.trim()}`);
    }

    const titleLine = summary ? `${config.title} ("${summary}")` : config.title;

    if (lines.length === 0 && !summary) {
        return '';
    }

    return `${titleLine}\n${lines.join('\n')}`;
};

// =================================================================
// 사이드바 데이터 구조
// =================================================================
const sidebarData = [
    { name: '성장', icon: <Bone size={18}/>, key: 'growth', items: [
            { name: '성장', key: 'growth_growth' }, { name: '성조숙증', key: 'growth_precocious_puberty' },
            { name: '저체중', key: 'growth_underweight' }, { name: '비만', key: 'growth_obesity' },
    ]},
    { name: '소화기', icon: <Utensils size={18}/>, key: 'digestive', items: [
            { name: '식욕부진', key: 'digestive_appetite' }, { name: '소화불량', key: 'digestive_indigestion' },
            { name: '오심/구역', key: 'digestive_nausea' }, { name: 'IBS', key: 'digestive_ibs' }, { name: '변비', key: 'digestive_constipation' },
    ]},
    { name: '호흡기', icon: <Wind size={18}/>, key: 'respiratory', items: [
            { name: '비염', key: 'respiratory_rhinitis' }, { name: '잦은 감기', key: 'respiratory_frequent_colds' },
            { name: '기침', key: 'respiratory_cough' }, { name: '코피', key: 'respiratory_epistaxis' }, { name: '천식', key: 'respiratory_asthma' },
    ]},
    { name: '신경계', icon: <Brain size={18}/>, key: 'nervous', items: [
            { name: '두통', key: 'nervous_headache' }, { name: '어지럼증', key: 'nervous_dizziness' },
            { name: 'TIC', key: 'nervous_tic' }, { name: 'ADHD', key: 'nervous_adhd' },
            { name: '실신', key: 'nervous_syncope' }, { name: '수험생 원보', key: 'nervous_student_care' },
            { name: '야뇨증', key: 'nervous_enuresis' }, { name: '경련', key: 'nervous_convulsion' }, { name: '야제', key: 'nervous_night_crying' },
    ]},
    { name: '피부', icon: <Layers size={18}/>, key: 'skin', items: [
            { name: '두한', key: 'skin_head_sweating' }, { name: '수족다한', key: 'skin_hand_foot_sweating' },
            { name: '아토피', key: 'skin_atopy' }, { name: '두드러기', key: 'skin_urticaria' }, { name: '피부염', key: 'skin_dermatitis' },
    ]},
    { name: '발달', icon: <PersonStanding size={18}/>, key: 'development', items: [
            { name: '언어/발달지연', key: 'development_language_delay' }, { name: 'ASD', key: 'development_asd' },
    ]},
    { name: '기타', icon: <MoreHorizontal size={18}/>, key: 'etc', items: [
            { name: '월경부조', key: 'etc_menstrual_disorders' }, { name: '수족냉', key: 'etc_cold_hands_feet' }, 
            { name: '구설', key: 'etc_oral_symptoms' },
    ]},
];

// =================================================================
// 1. 메인 앱 컴포넌트
// =================================================================
const App = () => {
    const [activeView, setActiveView] = useState<ChartMode>('digestive_appetite');
    const [formDatas, setFormDatas] = useState<{ [key in ChartMode]?: BaseFormData }>(initialFormData);
    const [summaries, setSummaries] = useState<{ [key in ChartMode]?: string }>({});
    const [chartParts, setChartParts] = useState<Record<string, string>>({});
    const [interactionOrder, setInteractionOrder] = useState<ChartMode[]>([]);
    const [combinedChart, setCombinedChart] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [additionalText, setAdditionalText] = useState('');

    const handleFormDataChange = useCallback((view: ChartMode, data: BaseFormData) => {
        setFormDatas(prev => ({ ...prev, [view]: data }));
    }, []);

    const handleSummaryChange = useCallback((view: ChartMode, summary: string) => {
        setSummaries(prev => ({...prev, [view]: summary }));
    }, []);

    const handleChartUpdate = useCallback((view: ChartMode, text: string) => {
        setChartParts(prev => ({ ...prev, [view]: text }));
        const hasText = text.trim() !== '';
        const isInOrder = interactionOrder.includes(view);

        if (hasText && !isInOrder) {
            setInteractionOrder(prev => [...prev, view]);
        } else if (!hasText && isInOrder) {
            setInteractionOrder(prev => prev.filter(item => item !== view));
        }
    }, [interactionOrder]);
  
    useEffect(() => {
        const mainChart = interactionOrder.map(key => chartParts[key]).filter(Boolean).join('\n\n');
        
        let newCombinedChart = mainChart;
        if (additionalText.trim()) {
            if (newCombinedChart) {
                newCombinedChart += '\n\n';
            }
            newCombinedChart += additionalText.trim();
        }
        
        setCombinedChart(newCombinedChart);
    }, [chartParts, interactionOrder, additionalText]);

    const copyToClipboard = useCallback(() => {
        if (!combinedChart) return;
        const textArea = document.createElement("textarea");
        textArea.value = combinedChart;
        textArea.style.position = "fixed"; 
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('복사 실패:', err);
        }
        document.body.removeChild(textArea);
    }, [combinedChart]);

    const resetAll = useCallback(() => {
        setFormDatas(initialFormData);
        setSummaries({});
        setChartParts({});
        setInteractionOrder([]);
        setCombinedChart('');
        setAdditionalText('');
    }, []);
    
    const views: { [key in ChartMode]?: React.ReactNode } = {};
    Object.keys(formConfig).forEach(keyStr => {
        const key = keyStr as ChartMode;
        if(formDatas[key]){
            views[key] = <ChartingComponent 
                key={key} 
                chartMode={key} 
                formData={formDatas[key]!} 
                summary={summaries[key] || ''}
                onFormChange={(data) => handleFormDataChange(key, data)} 
                onSummaryChange={(summary) => handleSummaryChange(key, summary)}
                onChartUpdate={handleChartUpdate} 
            />;
        }
    });

    return (
        <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen font-sans">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">한방소아과 차팅 Copilot ver.2</h1>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    <div className="sm:col-span-3">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Chief Complaint</h2>
                        <nav className="space-y-4">
                            {sidebarData.map(category => (
                                <div key={category.key}>
                                    <h3 className="flex items-center space-x-2 px-3 py-2 text-sm font-bold text-gray-800">
                                        {category.icon}
                                        <span>{category.name}</span>
                                    </h3>
                                    <div className="pl-3 mt-1 grid grid-cols-2 gap-1">
                                        {category.items.map(item => (
                                            <SidebarButton 
                                                key={item.key} 
                                                text={item.name} 
                                                isActive={activeView === item.key} 
                                                onClick={() => setActiveView(item.key as ChartMode)} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="sm:col-span-5">{views[activeView]}</div>
                    <div className="sm:col-span-4">
                        <ResultView 
                            generatedText={combinedChart} 
                            onTextChange={setCombinedChart} 
                            onCopy={copyToClipboard} 
                            isCopied={isCopied} 
                            onReset={resetAll}
                            additionalText={additionalText}
                            onAdditionalTextChange={setAdditionalText}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// 2. 범용 차팅 컴포넌트
// =================================================================
const ChartingComponent = ({ chartMode, formData, summary, onFormChange, onSummaryChange, onChartUpdate }: { 
    chartMode: ChartMode, 
    formData: BaseFormData, 
    summary: string,
    onFormChange: (data: BaseFormData) => void, 
    onSummaryChange: (summary: string) => void,
    onChartUpdate: (view: ChartMode, text: string) => void
}) => {
    const config = formConfig[chartMode];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFormChange({ ...formData, [name]: value });
    };

    const handleSymptomChange = (symptomKey: string, value: string) => {
        const currentVal = formData[symptomKey];
        onFormChange({ ...formData, [symptomKey]: currentVal === value ? '' : value });
    };

    useEffect(() => {
        const chartText = generateChartText(formData, config, summary);
        onChartUpdate(chartMode, chartText);
    }, [formData, summary, chartMode, onChartUpdate, config]);
    
    const renderField = (field: any, index: number) => {
        const fieldKey = `${chartMode}-${field.name || `field-${index}`}`;
        switch(field.type) {
            case 'text': return <InputField key={fieldKey} label={field.label} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} />;
            case 'combined_text': return <CombinedInputField key={fieldKey} label={field.label} nameNum={field.nameNum} nameText={field.nameText} valueNum={formData[field.nameNum]} valueText={formData[field.nameText]} unit={field.unit} placeholderNum={field.placeholderNum} placeholderText={field.placeholderText} onChange={handleChange} />;
            case 'textarea': return ( <div key={fieldKey} className="bg-yellow-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-700 mb-3">{field.title}</h3><InputField name={field.name} value={formData[field.name]} onChange={handleChange} placeholder="추가로 기록할 내용을 입력하세요..."/></div>);
            case 'symptoms_grid': return ( <div key={fieldKey} className="bg-red-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-700 mb-3">{field.title}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{field.symptoms.map((symptom: any) => (<SymptomChecker key={symptom.key} label={symptom.label} symptomKey={symptom.key} value={formData[symptom.key]} textValue={formData[`${symptom.key}Text`]} onStatusChange={handleSymptomChange} onTextChange={handleChange} textPlaceholder={symptom.textPlaceholder}/>))}{field.customField && <InputField label={field.customField.label} name={field.customField.name} value={formData[field.customField.name]} onChange={handleChange} placeholder={field.customField.placeholder} />}</div></div>);
            case 'symptoms_grid_three_options': return ( <div key={fieldKey} className="bg-purple-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-700 mb-3">{field.title}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{field.symptoms.map((symptom: any) => (<SymptomCheckerThreeOptions key={symptom.key} label={symptom.label} symptomKey={symptom.key} value={formData[symptom.key]} textValue={formData[`${symptom.key}Text`]} onStatusChange={handleSymptomChange} onTextChange={handleChange} />))}</div></div>);
            case 'group': return ( <div key={fieldKey} className="bg-blue-50 p-4 rounded-lg space-y-4"><h3 className="text-lg font-semibold text-gray-700">{field.title}</h3>{field.fields.map((subField: any, subIndex: number) => renderSubField(subField, subIndex))}</div>);
            case 'horizontal_group': return ( <div key={fieldKey} className="bg-green-50 p-4 rounded-lg space-y-4"><h3 className="text-lg font-semibold text-gray-700 mb-3">{field.title}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{field.fields.map((subField: any, subIndex: number) => renderField(subField, subIndex))}</div></div>);
            case 'green_group': return ( <div key={fieldKey} className="bg-green-50 p-4 rounded-lg space-y-4"><h3 className="text-lg font-semibold text-gray-700">{field.title}</h3>{field.fields.map((subField: any, subIndex: number) => renderSubField(subField, subIndex))}</div>);
            case 'radio_with_text': return <RadioGroupWithText key={fieldKey} label={field.label} name={field.name} nameText={field.nameText} value={formData[field.name]} textValue={formData[field.nameText]} options={field.options} onChange={handleChange} />;
            case 'select': return <SelectField key={fieldKey} label={field.label} name={field.name} value={formData[field.name]} options={field.options} onChange={handleChange} />;
            case 'select_with_text': return <SelectWithText key={fieldKey} label={field.label} name={field.name} nameText={field.nameText} value={formData[field.name]} textValue={formData[field.nameText]} options={field.options} onChange={handleChange} alwaysShowText={field.alwaysShowText}/>;
            case 'pronunciation_sample': return <PronunciationSampler key={fieldKey} title={field.title} words={field.words} formData={formData} onChange={handleChange} />;
            case 'info_box': return <InfoBox key={fieldKey} title={field.title} lines={field.lines} />;
            default: return config.fields.length > 0 ? <div key={fieldKey} className="p-4 text-center text-gray-500">[{config.title}] 상세 항목을 준비 중입니다.</div> : null;
        }
    };
    
    // horizontal_group을 group 내부에 렌더링하기 위한 헬퍼
    const renderSubField = (field: any, index: number) => {
        if(field.type === 'horizontal_group') {
             return (<div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">{field.fields.map(renderField)}</div>)
        }
        return renderField(field, index);
    }
    
    // group 렌더링 로직 수정
    const renderGroupField = (field: any, index: number) => {
         const fieldKey = `${chartMode}-group-${index}`;
         if (field.type === 'group') {
            return ( <div key={fieldKey} className="bg-blue-50 p-4 rounded-lg space-y-4"><h3 className="text-lg font-semibold text-gray-700">{field.title}</h3>{field.fields.map(renderSubField)}</div>);
         }
         if (field.type === 'green_group') {
            return ( <div key={fieldKey} className="bg-green-50 p-4 rounded-lg space-y-4"><h3 className="text-lg font-semibold text-gray-700">{field.title}</h3>{field.fields.map(renderSubField)}</div>);
         }
         return renderField(field, index);
    }

    return (
        <>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">{config.title.replace('#', '')}</h2>
                {chartMode !== 'etc_additional_text' && (
                    <InputField 
                        name="summary" 
                        value={summary}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSummaryChange(e.target.value)}
                        placeholder="한 줄 요약..."
                    />
                )}
            </div>

            {config.warning && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    <AlertTriangle size={18} />
                    <span className="font-medium">{config.warning}</span>
                </div>
            )}
            
            <div className="space-y-6">
                {config.fields.map((field: any, index: number) => renderGroupField(field, index))}
            </div>
        </>
    );
};

// =================================================================
// 5. 재사용 UI 컴포넌트
// =================================================================
const PronunciationSampler = ({ title, words, formData, onChange }: any) => (
    <div className="bg-green-50 p-4 rounded-lg space-y-3">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            {words.map((word: string) => (
                <div key={word}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{word}</label>
                    <input 
                        type="text" 
                        name={`pronunciation_${word}`} 
                        value={formData[`pronunciation_${word}`] || ''} 
                        onChange={onChange} 
                        placeholder="발음 입력"
                        className="w-full p-2 border border-gray-300 rounded text-sm" 
                    />
                </div>
            ))}
        </div>
    </div>
);
const InfoBox = ({ title, lines }: any) => (
    <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-500 mt-2">
        <p className="font-semibold mb-1 text-gray-600">{title}</p>
        <ul className="list-none space-y-0.5">
            {lines.map((line: string, index: number) => <li key={index}>{line}</li>)}
        </ul>
    </div>
);
const InputField = ({ label, name, value, onChange, placeholder }: any) => (<div>{label && <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>}<input type="text" name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded text-sm" /></div>);
const CombinedInputField = ({ label, nameNum, nameText, valueNum, valueText, unit, placeholderNum, placeholderText, onChange }: any) => (<div><label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label><div className="flex items-center space-x-2"><input type="number" name={nameNum} value={valueNum || ''} onChange={onChange} placeholder={placeholderNum} className="w-24 p-2 border border-gray-300 rounded text-sm"/><span className="text-gray-600 text-sm">{unit}</span><input type="text" name={nameText} value={valueText || ''} onChange={onChange} placeholder={placeholderText} className="flex-1 p-2 border border-gray-300 rounded text-sm"/></div></div>);
const RadioGroupWithText = ({ label, name, nameText, value, textValue, options, onChange }: any) => (<div><label className="text-sm font-medium text-gray-700 mb-2 block">{label}</label><div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">{options.map((option:string) => (<label key={option} className="flex items-center space-x-1 cursor-pointer"><input type="radio" name={name} value={option} checked={value === option} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/><span className="text-sm">{option}</span></label>))}</div><InputField name={nameText} value={textValue} onChange={onChange} placeholder="세부사항 입력..."/></div>);
const SelectField = ({ label, name, value, options, onChange }: any) => (<div><label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label><select name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded text-sm bg-white"><option value="" disabled>{options[0]}</option>{options.slice(1).map((option:string) => (<option key={option} value={option}>{option}</option>))}</select></div>);
const SelectWithText = ({ label, name, nameText, value, textValue, options, onChange, alwaysShowText }: any) => (
    <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <select name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded text-sm bg-white flex-1">
                <option value="">{options[0]}</option>
                {options.slice(1).map((option:string) => (<option key={option} value={option}>{option}</option>))}
            </select>
            {(alwaysShowText || (value && value !== options[0])) && (
                <div className="w-full flex-1">
                    <InputField 
                        name={nameText} 
                        value={textValue} 
                        onChange={onChange} 
                        placeholder="세부사항..." 
                    />
                </div>
            )}
        </div>
    </div>
);
const SymptomChecker = ({ label, symptomKey, value, textValue, onStatusChange, onTextChange, textPlaceholder }: any) => {
    const handleStatusChange = (statusValue: string) => onStatusChange(symptomKey, statusValue);
    const getButtonClass = (buttonValue: '+' | '-') => {
        const base = "px-2.5 py-1 rounded border text-sm font-semibold transition-colors";
        if (value === buttonValue) return buttonValue === '+' ? `${base} bg-green-600 text-white border-green-700` : `${base} bg-red-600 text-white border-red-700`;
        return buttonValue === '+' ? `${base} bg-white text-green-700 border-gray-300 hover:bg-green-50` : `${base} bg-white text-red-700 border-gray-300 hover:bg-red-50`;
    };
    return (<div className="space-y-2"><div className="flex items-center space-x-2"><span className="text-sm font-medium text-gray-700 min-w-fit">{label}:</span><div className="flex space-x-2"><button type="button" onClick={() => handleStatusChange('+')} className={getButtonClass('+')}>+</button><button type="button" onClick={() => handleStatusChange('-')} className={getButtonClass('-')}>-</button></div></div>{value && (<input type="text" name={`${symptomKey}Text`} placeholder={textPlaceholder || `${label} 세부사항...`} value={textValue || ''} onChange={onTextChange} className="w-full p-1.5 border border-gray-300 rounded text-xs" />)}</div>);
};
const SymptomCheckerThreeOptions = ({ label, symptomKey, value, textValue, onStatusChange, onTextChange }: any) => {
    const options: Array<'++' | '+' | '-'> = ['++', '+', '-'];
    const getButtonClass = (optionValue: '++' | '+' | '-') => {
        const base = "px-2.5 py-1 rounded border text-sm font-semibold transition-colors";
        const colorClasses = { '++': 'bg-red-600 text-white border-red-700', '+': 'bg-green-600 text-white border-green-700', '-': 'bg-gray-500 text-white border-gray-600' };
        const hoverClasses = { '++': 'bg-white text-red-700 border-gray-300 hover:bg-red-50', '+': 'bg-white text-green-700 border-gray-300 hover:bg-green-50', '-': 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' };
        return value === optionValue ? `${base} ${colorClasses[optionValue]}` : `${base} ${hoverClasses[optionValue]}`;
    };
    return (<div className="space-y-2"><div className="flex items-center space-x-2"><span className="text-sm font-medium text-gray-700 min-w-fit">{label}:</span><div className="flex space-x-2">{options.map(opt => (<button key={opt} type="button" onClick={() => onStatusChange(symptomKey, opt)} className={getButtonClass(opt)}>{opt}</button>))}</div></div>{value && (<input type="text" name={`${symptomKey}Text`} placeholder={`${label} 세부사항...`} value={textValue || ''} onChange={onTextChange} className="w-full p-1.5 border border-gray-300 rounded text-xs"/>)}</div>);
};
const SidebarButton = ({ text, isActive, onClick }: any) => (<button onClick={onClick} className={`w-full text-left px-2 py-1.5 text-sm font-medium rounded-md transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}><span>{text}</span></button>);
const ResultView = ({ generatedText, onTextChange, onCopy, isCopied, onReset, additionalText, onAdditionalTextChange }: any) => (
    <div className="sticky top-6 h-[calc(100vh-80px)] bg-gray-100 p-4 rounded-lg shadow-inner flex flex-col">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">📋 Medical Chart</h3>
            <div className="flex space-x-2">
                <button onClick={onCopy} disabled={!generatedText && !additionalText} className={`flex items-center space-x-1.5 px-3 py-2 text-white rounded-md text-sm transition-all duration-200 ${isCopied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400`}>
                    {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    <span>{isCopied ? '복사됨!' : '복사'}</span>
                </button>
                <button onClick={onReset} className="flex items-center space-x-1.5 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                    <RefreshCw size={16} />
                    <span>초기화</span>
                </button>
            </div>
        </div>
        <textarea 
            value={generatedText} 
            onChange={(e) => onTextChange(e.target.value)} 
            className="w-full flex-grow p-4 resize-none text-sm text-gray-800 border-2 border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="항목을 입력하면 차팅이 자동으로 생성됩니다." 
        />
        <div className="pt-2 mt-2 border-t border-gray-300">
            <h3 className="text-md font-semibold text-gray-700 mb-2">➕ 추가 입력</h3>
            <textarea 
                value={additionalText} 
                onChange={(e) => onAdditionalTextChange(e.target.value)}
                className="w-full h-32 p-2 resize-none text-sm text-gray-800 border-2 border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="추가 내용을 자유롭게 입력하세요."
            />
        </div>
    </div>
);

export default App;


